import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { teamId, message } = await req.json()

    if (!teamId || !message) {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
    }

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('title, content')
      .eq('team_id', teamId)

    if (docsError) {
      return NextResponse.json({ error: '문서 조회 실패: ' + docsError.message }, { status: 500 })
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: '등록된 문서가 없습니다. 먼저 문서를 추가해주세요.',
        sources: [],
      })
    }

    const docsContext = documents
      .map((doc, i) => `[문서 ${i + 1}] 제목: ${doc.title}\n내용:\n${doc.content}`)
      .join('\n\n---\n\n')

    const systemPrompt = `당신은 ${team.name} 전용 내부 지식 도우미입니다.
아래 제공된 문서들의 내용만을 기반으로 질문에 답변하세요.

규칙:
- 문서에 있는 내용만 답변할 것
- 답변은 구체적이고 상세하게 작성할 것
- 관련된 조건, 예외사항, 절차가 있으면 함께 안내할 것
- 단순히 핵심만 말하지 말고 실제로 도움이 되는 부가 정보도 포함할 것
- 단, 문서에 없는 내용은 절대 지어내거나 추측하지 말 것
- 문서에 있는 내용만 상세하게 안내하고, 없는 내용은 "등록된 문서에서 찾을 수 없습니다"라고 답할 것
- 답변 마지막에 반드시 참고한 문서 제목을 명시할 것 (예: [참고문서: 제목명])
- 마크다운 문법(별표, 샵, 백틱 등)을 절대 사용하지 말 것
- 일반 텍스트와 줄바꿈만 사용하여 답변할 것
- 목록은 "- " 대신 "• " 또는 번호(1. 2. 3.)로 표현할 것

=== 제공된 문서 ===
${docsContext}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContent(message)
    const rawAnswer = result.response.text()

    const sourceMatches = [...rawAnswer.matchAll(/\[참고문서:\s*([^\]]+)\]/g)]
    const sources = sourceMatches.map((m) => m[1].trim())
    const answer = rawAnswer.replace(/\[참고문서:\s*[^\]]+\]/g, '').trim()

    return NextResponse.json({ answer, sources })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    console.error('[chat API error]', message)
    return NextResponse.json({ error: '서버 오류: ' + message }, { status: 500 })
  }
}
