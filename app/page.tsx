'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team } from '@/types'
import { getCharacterComponent } from '@/components/TeamCharacter'
import GuideModal from '@/components/GuideModal'

export default function HomePage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  // 팀 입장 모달
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // 가이드
  const [guideOpen, setGuideOpen] = useState(false)

  // 관리자 모달
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*').order('created_at')
    setTeams(data || [])
    setLoading(false)
  }

  function openModal(team: Team) {
    setSelectedTeam(team)
    setPassword('')
    setShowPassword(false)
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedTeam(null)
    setPassword('')
    setError('')
  }

  async function handleLogin() {
    if (!selectedTeam) return
    if (password === selectedTeam.password) {
      router.push(`/team/${selectedTeam.id}`)
    } else {
      setError('비밀번호가 올바르지 않습니다 🔒')
    }
  }

  function openAdminModal() {
    setAdminPassword('')
    setShowAdminPassword(false)
    setAdminError('')
    setAdminModalOpen(true)
  }

  function closeAdminModal() {
    setAdminModalOpen(false)
    setAdminPassword('')
    setAdminError('')
  }

  async function handleAdminLogin() {
    if (!adminPassword.trim()) return
    setAdminLoading(true)
    setAdminError('')
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAdminError(data.error || '인증 실패')
        setAdminLoading(false)
        return
      }
      sessionStorage.setItem('adminAuth', 'true')
      router.push('/admin')
    } catch {
      setAdminError('오류가 발생했습니다. 다시 시도해주세요.')
      setAdminLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <GuideModal forceOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      {/* 헤더 */}
      <header className="bg-[#1e3a5f] text-white pt-10 pb-10 px-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-sky-400/10 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-sky-300/10 rounded-full translate-x-20 translate-y-20" />
        <div className="absolute top-4 right-1/4 w-6 h-6 bg-sky-300/20 rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-sky-400/20 text-sky-200 text-xs font-medium px-3 py-1 rounded-full mb-4">
            문서 기반 챗봇
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">문서 기반 AI 도우미</h1>
          <p className="mt-3 text-sky-200 text-sm">
            등록된 문서를 기반으로 정확하게 답변해드려요
          </p>
          <button
            onClick={() => router.push('/demo')}
            className="mt-5 inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50 text-sm font-bold px-5 py-2.5 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          >
            🤖 서비스 체험해보기
          </button>
        </div>
      </header>

      {/* 카드 그리드 */}
      <div className="max-w-5xl mx-auto px-6 py-10 pb-24">
        {loading ? (
          <div className="text-center text-sky-400 py-20 text-sm animate-pulse">불러오는 중...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-gray-400 text-sm">등록된 팀이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const Character = getCharacterComponent(team.character)
              return (
                <div
                  key={team.id}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2 cursor-default border border-sky-100"
                >
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-inner">
                    <Character size={72} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-base font-bold text-[#1e3a5f]">{team.name}</h2>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{team.description}</p>
                  </div>
                  <button
                    onClick={() => openModal(team)}
                    className="w-full py-2.5 bg-[#1e3a5f] hover:bg-sky-600 text-white rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
                  >
                    입장하기 →
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 우측 하단 버튼 */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => setGuideOpen(true)}
          className="bg-white hover:bg-gray-50 text-[#1e3a5f] border border-sky-200 px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        >
          사용 가이드
        </button>
        <button
          onClick={openAdminModal}
          className="bg-white hover:bg-gray-50 text-[#1e3a5f] border border-sky-200 px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        >
          관리자
        </button>
      </div>

      {/* 팀 입장 모달 */}
      {modalOpen && selectedTeam && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-sky-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                {(() => {
                  const Character = getCharacterComponent(selectedTeam.character)
                  return <Character size={44} />
                })()}
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] text-center mb-1">{selectedTeam.name}</h3>
            <p className="text-xs text-gray-400 text-center mb-6">비밀번호를 입력하세요</p>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="비밀번호 입력"
                className="w-full border-2 border-sky-200 focus:border-[#1e3a5f] rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a5f] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
                취소
              </button>
              <button onClick={handleLogin} className="flex-1 py-2.5 bg-[#1e3a5f] hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm">
                입장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 인증 모달 */}
      {adminModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={closeAdminModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-sky-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">
                🔐
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] text-center mb-1">관리자 인증</h3>
            <p className="text-xs text-gray-400 text-center mb-6">관리자 비밀번호를 입력하세요</p>

            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setAdminError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="관리자 비밀번호"
                className="w-full border-2 border-sky-200 focus:border-[#1e3a5f] rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a5f] transition-colors"
                tabIndex={-1}
              >
                {showAdminPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {adminError && <p className="text-red-400 text-xs mt-2 text-center">{adminError}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={closeAdminModal} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
                취소
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={adminLoading}
                className="flex-1 py-2.5 bg-[#1e3a5f] hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                {adminLoading ? '확인 중...' : '입장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
