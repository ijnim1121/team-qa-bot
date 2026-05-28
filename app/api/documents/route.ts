import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// pdfjs-dist requires the worker to be injected before getDocument is called.
// In Node.js there is no browser Worker, so we use the "fake worker" path:
// setting globalThis.pdfjsWorker makes pdfjs use WorkerMessageHandler inline.
// We cache the promise so the module is only imported once.
// pdfjs requires WorkerMessageHandler injected before getDocument() is called.
// We import both lib and worker together once at module load so the first
// request never races against an uninitialised globalThis.pdfjsWorker.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfjsReady: Promise<any> = Promise.all([
  import('pdfjs-dist/legacy/build/pdf.mjs'),
  // @ts-ignore – worker build has no .d.ts
  import('pdfjs-dist/legacy/build/pdf.worker.mjs'),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
]).then(([lib, worker]: [any, any]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).pdfjsWorker = worker
  // Replace the memoised _setupFakeWorkerGlobal (which shadow() stores as a
  // configurable data property) with a pre-resolved Promise so pdfjs uses
  // WorkerMessageHandler inline instead of fetching a worker URL.
  // NOTE: do NOT delete — that removes the property entirely and the next
  // access returns undefined, causing ".then of undefined".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.defineProperty(lib.PDFWorker as any, '_setupFakeWorkerGlobal', {
    value: Promise.resolve(worker.WorkerMessageHandler),
    enumerable: true,
    configurable: true,
    writable: false,
  })
  return lib
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const teamId = formData.get('teamId') as string
  const sourceType = formData.get('sourceType') as string

  if (!teamId || !sourceType) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다' }, { status: 400 })
  }

  let title = ''
  let content = ''
  let sourceUrl: string | null = null
  let fileUrl: string | null = null

  if (sourceType === 'text') {
    title = formData.get('title') as string
    content = formData.get('content') as string

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 })
    }
  } else if (sourceType === 'url') {
    sourceUrl = formData.get('url') as string
    title = (formData.get('title') as string) || sourceUrl

    try {
      const cheerio = await import('cheerio')
      const res = await fetch(sourceUrl)
      const html = await res.text()
      const $ = cheerio.load(html)
      $('script, style, nav, footer, header').remove()
      content = $('body').text().replace(/\s+/g, ' ').trim()

      if (!content) {
        return NextResponse.json({ error: '페이지에서 텍스트를 추출할 수 없습니다' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'URL 크롤링에 실패했습니다' }, { status: 400 })
    }
  } else if (sourceType === 'pdf') {
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })

    title = file.name.replace(/\.pdf$/i, '')
    const buffer = Buffer.from(await file.arrayBuffer())

    // 원본 파일 Storage 업로드
    const storagePath = `${teamId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false })
    if (uploadError) {
      console.error('[Storage upload error - pdf]', uploadError.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)
      fileUrl = publicUrl
    }

    try {
      const pdfjsLib = await pdfjsReady
      const uint8Array = new Uint8Array(buffer)
      const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true }).promise
      const pages: string[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
        pages.push(pageText)
      }
      content = pages.join('\n').trim()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: 'PDF 파싱에 실패했습니다: ' + msg }, { status: 400 })
    }
  } else if (sourceType === 'word') {
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })

    title = file.name.replace(/\.(docx?|hwp)$/i, '')
    const buffer = Buffer.from(await file.arrayBuffer())

    // 원본 파일 Storage 업로드
    const storagePath = `${teamId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadError) {
      console.error('[Storage upload error - word]', uploadError.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)
      fileUrl = publicUrl
    }

    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      content = result.value.trim()
    } catch {
      return NextResponse.json({ error: 'Word 파싱에 실패했습니다' }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다' }, { status: 400 })
  }

  const { error } = await supabase.from('documents').insert({
    team_id: teamId,
    title,
    content,
    source_type: sourceType,
    source_url: sourceUrl,
    file_url: fileUrl,
  })

  if (error) {
    return NextResponse.json({ error: 'DB 저장에 실패했습니다: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
