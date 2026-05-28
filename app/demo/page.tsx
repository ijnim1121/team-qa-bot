'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from '@/types'

const EXAMPLE_QUESTIONS = [
  '이 서비스가 어떤 건가요?',
  '어떤 파일을 올릴 수 있나요?',
  '팀은 어떻게 만드나요?',
  '어떤 용도로 쓸 수 있나요?',
]

export default function DemoPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function sendMessage(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setLoading(true)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

    try {
      const res = await fetch('/api/demo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다'
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col">
      {/* 헤더 */}
      <header className="bg-[#1e3a5f] text-white px-5 py-3.5 shadow-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-sky-200 hover:text-white transition-colors text-sm"
          >
            ←
          </button>
          <div className="w-8 h-8 rounded-full bg-sky-400/20 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">서비스 체험 데모</h1>
          </div>
        </div>
        <span className="text-xs bg-sky-400/30 text-sky-200 px-2.5 py-1 rounded-full font-medium border border-sky-400/30">
          DEMO
        </span>
      </header>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 px-4">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-inner text-5xl">
                🤖
              </div>
            </div>
            <p className="text-lg font-bold text-[#1e3a5f] mt-2">안녕하세요! 👋</p>
            <p className="text-sm text-gray-500 mt-1">이 서비스에 대해 뭐든 물어보세요</p>
            <p className="text-xs text-gray-400 mt-0.5">아래 예시 질문을 눌러보거나 직접 입력해보세요</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm text-base">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1e3a5f] text-white rounded-3xl rounded-br-md shadow-md'
                    : 'bg-white text-gray-800 rounded-3xl rounded-bl-md shadow-md border border-sky-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm text-base">
                🤖
              </div>
              <div className="bg-white shadow-md border border-sky-100 px-5 py-3.5 rounded-3xl rounded-bl-md">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* 예시 질문 + 입력 영역 */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-sky-100 px-4 pt-3 pb-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-3 flex-wrap">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3.5 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-sky-600 hover:bg-sky-100 hover:border-sky-300 transition-all duration-200 font-medium"
                >
                  {q}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="서비스에 대해 궁금한 것을 물어보세요..."
              disabled={loading}
              className="flex-1 border-2 border-sky-200 focus:border-[#1e3a5f] rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/40 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-[#1e3a5f] hover:bg-sky-600 disabled:opacity-40 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-sm"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
