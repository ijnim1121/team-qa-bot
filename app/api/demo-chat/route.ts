import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const DEMO_CONTEXT = `
서비스명: 팀 지식베이스 Q&A 봇

=== 서비스 소개 ===
팀 지식베이스 Q&A 봇은 팀이 보유한 문서(매뉴얼, 규정, 가이드 등)를 AI가 학습하여, 팀원들이 자연어로 질문하면 문서 기반으로 정확하게 답변해주는 서비스입니다.

=== 주요 기능 ===
1. 팀별 독립 지식베이스: 각 팀마다 별도의 채팅 공간과 문서 저장소를 가집니다.
2. 다양한 문서 형식 지원: PDF, Word(docx), 텍스트 직접 입력, URL(웹페이지 크롤링) 모두 지원합니다.
3. AI 질의응답: 등록된 문서를 기반으로 AI가 질문에 답변합니다. 문서에 없는 내용은 지어내지 않습니다.
4. 출처 표시: 답변 시 어떤 문서를 참고했는지 함께 표시됩니다.
5. 파일 다운로드: 업로드한 PDF나 Word 문서는 언제든지 다시 다운로드할 수 있습니다.

=== 사용 방법 ===
1. 메인 화면에서 팀 카드를 찾아 입장하기 버튼을 클릭합니다.
2. 팀 비밀번호를 입력하면 해당 팀의 채팅 화면으로 이동합니다.
3. 채팅창에 궁금한 것을 입력하면 AI가 등록된 문서를 기반으로 답변합니다.
4. 문서 관리 버튼으로 새 문서를 추가하거나 기존 문서를 확인할 수 있습니다.

=== 문서 등록 방법 ===
문서 관리 페이지에서 아래 4가지 방식으로 문서를 등록할 수 있습니다.
- PDF 업로드: PDF 파일을 직접 업로드합니다.
- Word 업로드: .docx 형식의 Word 파일을 업로드합니다.
- 텍스트 입력: 제목과 내용을 직접 입력합니다. 회의록, 공지사항 등에 적합합니다.
- URL 등록: 웹페이지 주소를 입력하면 내용을 자동으로 가져옵니다.

=== 팀 생성 및 관리 ===
- 팀 생성, 삭제, 비밀번호 변경은 관리자만 가능합니다.
- 관리자 페이지는 메인 화면 우측 하단 "관리자" 버튼으로 접근합니다.
- 문서 삭제도 관리자 권한이 필요합니다.
- 문서 추가는 팀 비밀번호만 알면 누구든 가능합니다.

=== 활용 예시 ===
- 사내 규정/정책 Q&A: 취업규칙, 복무 규정, 보안 정책 등을 등록하면 팀원들이 쉽게 조회 가능
- 업무 매뉴얼 봇: 시스템 사용 매뉴얼, 프로세스 가이드를 등록하면 신규 팀원 온보딩에 활용
- 회의록/공지 아카이브: 주요 결정사항이나 공지를 저장하고 나중에 검색 가능
- 프로젝트 문서 봇: 기술 문서, API 명세, 설계서를 등록하면 개발팀이 빠르게 참조 가능

=== 기술 스택 ===
- 프론트엔드: Next.js, Tailwind CSS
- 백엔드: Next.js API Routes
- 데이터베이스: Supabase (PostgreSQL)
- 파일 저장: Supabase Storage
- AI: Google Gemini API (gemini-2.5-flash)
`

const systemPrompt = `당신은 "팀 지식베이스 Q&A 봇" 서비스의 데모 도우미입니다.
아래 제공된 서비스 소개 문서를 기반으로 방문자의 질문에 친절하게 답변하세요.

규칙:
- 문서에 있는 내용만 답변할 것
- 문서에 없는 내용은 "해당 내용은 서비스 소개에서 확인하기 어렵습니다"라고 답할 것
- 답변은 친근하고 간결하게 작성할 것
- 마크다운 문법(별표, 샵, 백틱 등)을 절대 사용하지 말 것
- 일반 텍스트와 줄바꿈만 사용할 것
- 목록은 "• " 또는 번호(1. 2. 3.)로 표현할 것

=== 서비스 소개 문서 ===
${DEMO_CONTEXT}`

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: '메시지가 없습니다' }, { status: 400 })

    const callWithRetry = async (modelName: string): Promise<string> => {
      let attempt = 0
      while (true) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt })
          const result = await model.generateContent(message)
          return result.response.text()
        } catch (err) {
          const msg = err instanceof Error ? err.message : ''
          if (msg.includes('503') && attempt < 2) {
            attempt++
            await new Promise(r => setTimeout(r, attempt * 2000))
            continue
          }
          throw err
        }
      }
    }

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-8b']
    let answer = ''
    let lastErr: unknown

    for (const modelName of models) {
      try {
        answer = await callWithRetry(modelName)
        break
      } catch (err) {
        lastErr = err
        const msg = err instanceof Error ? err.message : ''
        if (!msg.includes('429') && !msg.includes('404') && !msg.includes('503')) throw err
      }
    }

    if (!answer) throw lastErr

    return NextResponse.json({ answer })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    console.error('[demo-chat error]', message)
    return NextResponse.json({ error: '서버 오류: ' + message }, { status: 500 })
  }
}
