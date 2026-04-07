import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    try {
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(buffer)
      content = parsed.text.trim()
    } catch {
      return NextResponse.json({ error: 'PDF 파싱에 실패했습니다' }, { status: 400 })
    }
  } else if (sourceType === 'word') {
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })

    title = file.name.replace(/\.(docx?|hwp)$/i, '')
    const buffer = Buffer.from(await file.arrayBuffer())

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
  })

  if (error) {
    return NextResponse.json({ error: 'DB 저장에 실패했습니다: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
