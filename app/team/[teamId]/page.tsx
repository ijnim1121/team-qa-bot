'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team, ChatMessage } from '@/types'
import { getCharacterComponent } from '@/components/TeamCharacter'

const EXAMPLE_QUESTIONS = [
  '이 시스템에서 자주 발생하는 오류는 무엇인가요?',
  '연계 개발 프로세스를 설명해주세요',
  '관련 담당자 연락처를 알려주세요',
]

export default function TeamChatPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTeam()
  }, [teamId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchTeam() {
    const { data } = await supabase.from('teams').select('*').eq('id', teamId).single()
    if (!data) {
      router.push('/')
      return
    }
    setTeam(data)
  }

  async function sendMessage(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: userText }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, message: userText }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `서버 오류 (${res.status})`)
      }
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${msg}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const Character = team ? getCharacterComponent(team.character) : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col">
      {/* 헤더 */}
      <header className="bg-[#1e3a5f] text-white px-5 py-3.5 shadow-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-sky-200 hover:text-white transition-colors hover:scale-110 active:scale-95 text-sm"
          >
            ←
          </button>
          {Character && (
            <div className="w-8 h-8 rounded-full bg-sky-400/20 flex items-center justify-center">
              <Character size={22} />
            </div>
          )}
          <h1 className="text-base font-bold">{team?.name || '로딩 중...'}</h1>
        </div>
        <button
          onClick={() => router.push(`/team/${teamId}/admin`)}
          className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all duration-200 font-medium border border-white/20"
        >
          문서 관리
        </button>
      </header>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 px-4">
            {Character && (
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-inner">
                  <Character size={60} />
                </div>
              </div>
            )}
            <p className="text-lg font-bold text-[#1e3a5f] mt-2">
              안녕하세요! 👋
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {team?.name} Q&A 봇입니다
            </p>
            <p className="text-xs text-gray-400 mt-0.5">아래 예시 질문을 눌러보거나 직접 질문해보세요</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* AI 아바타 */}
              {msg.role === 'assistant' && Character && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Character size={20} />
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
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-sky-100">
                    {msg.sources.map((src, si) => (
                      <p key={si} className="text-xs text-sky-400 flex items-center gap-1">
                        <span>📎</span> <span>참고: {src}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              {Character && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Character size={20} />
                </div>
              )}
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
          {messages.length === 0 && (
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
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="궁금한 것을 물어보세요..."
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
