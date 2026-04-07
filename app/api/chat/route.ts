import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { teamId, message } = await req.json()

  if (!teamId || !message) {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
  }

  // 팀 정보 조회
  const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).single()
  if (!team) {
    return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
  }

  // 해당 팀의 문서 조회
  const { data: documents } = await supabase
    .from('documents')
    .select('title, content')
    .eq('team_id', teamId)

  if (!documents || documents.length === 0) {
    return NextResponse.json({
      answer: '등록된 문서가 없습니다. 먼저 문서를 추가해주세요.',
      sources: [],
    })
  }

  // 문서를 컨텍스트로 변환
  const docsContext = documents
    .map((doc, i) => `[문서 ${i + 1}] 제목: ${doc.title}\n내용:\n${doc.content}`)
    .join('\n\n---\n\n')

  const systemPrompt = `당신은 ${team.name} 전용 내부 지식 도우미입니다.
아래 제공된 문서들의 내용만을 기반으로 질문에 답변하세요.

규칙:
- 문서에 있는 내용만 답변할 것
- 답변 마지막에 반드시 참고한 문서 제목을 명시할 것 (예: [참고문서: 제목명])
- 문서에 없는 내용은 "등록된 문서에서 찾을 수 없습니다"라고 답변할 것
- 절대 추측하거나 내용을 지어내지 말 것

=== 제공된 문서 ===
${docsContext}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  })

  const rawAnswer = response.content[0].type === 'text' ? response.content[0].text : ''

  // 참고문서 파싱
  const sourceMatches = [...rawAnswer.matchAll(/\[참고문서:\s*([^\]]+)\]/g)]
  const sources = sourceMatches.map((m) => m[1].trim())
  const answer = rawAnswer.replace(/\[참고문서:\s*[^\]]+\]/g, '').trim()

  return NextResponse.json({ answer, sources })
}
