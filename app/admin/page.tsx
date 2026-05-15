'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Team } from '@/types'
import { getCharacterComponent } from '@/components/TeamCharacter'

export default function AdminPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // 비밀번호 변경 모달
  const [pwModal, setPwModal] = useState<Team | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      router.replace('/')
      return
    }
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*').order('created_at')
    setTeams(data || [])
    setLoading(false)
  }

  async function handleDelete(team: Team) {
    if (!confirm(`"${team.name}" 팀을 삭제하시겠습니까?\n해당 팀의 모든 문서도 함께 삭제됩니다.`)) return
    setDeleting(team.id)
    const res = await fetch(`/api/admin/teams/${team.id}`, { method: 'DELETE' })
    if (res.ok) {
      setTeams((prev) => prev.filter((t) => t.id !== team.id))
    }
    setDeleting(null)
  }

  function openPwModal(team: Team) {
    setPwModal(team)
    setNewPassword('')
    setPwError('')
  }

  async function handlePasswordChange() {
    if (!pwModal) return
    if (!newPassword.trim()) { setPwError('새 비밀번호를 입력해주세요'); return }
    setPwSaving(true)
    const res = await fetch(`/api/admin/teams/${pwModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) {
      setPwError(data.error || '변경 실패')
      setPwSaving(false)
      return
    }
    setTeams((prev) => prev.map((t) => t.id === pwModal.id ? { ...t, password: newPassword } : t))
    setPwModal(null)
    setPwSaving(false)
  }

  function handleLogout() {
    sessionStorage.removeItem('adminAuth')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <header className="bg-[#1e3a5f] text-white px-5 py-4 shadow-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-sky-200 hover:text-white transition-colors text-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold">관리자 페이지</h1>
            <p className="text-xs text-sky-300">팀 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/admin/teams/new')}
            className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all duration-200 font-semibold border border-white/20"
          >
            + 팀 추가
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-sky-300 hover:text-white px-2 py-1.5 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {loading ? (
          <div className="text-center text-sky-400 py-20 text-sm animate-pulse">불러오는 중...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏢</p>
            <p className="text-gray-500 font-medium">등록된 팀이 없습니다</p>
            <button
              onClick={() => router.push('/admin/teams/new')}
              className="mt-6 px-6 py-3 bg-[#1e3a5f] hover:bg-sky-600 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              첫 팀 추가하기
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">총 {teams.length}개 팀</p>
            <div className="flex flex-col gap-3">
              {teams.map((team) => {
                const Character = getCharacterComponent(team.character)
                return (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* 캐릭터 */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <Character size={32} />
                    </div>

                    {/* 팀 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{team.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{team.description || '설명 없음'}</p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        비밀번호: <span className="font-mono text-gray-400">{team.password}</span>
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openPwModal(team)}
                        className="text-xs px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-lg transition-colors font-medium"
                      >
                        비밀번호 변경
                      </button>
                      <button
                        onClick={() => handleDelete(team)}
                        disabled={deleting === team.id}
                        className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-lg transition-colors disabled:opacity-40 font-medium"
                      >
                        {deleting === team.id ? '삭제 중...' : '팀 삭제'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 비밀번호 변경 모달 */}
      {pwModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setPwModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-sky-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#1e3a5f] mb-1">비밀번호 변경</h3>
            <p className="text-xs text-gray-400 mb-5">{pwModal.name}</p>

            <div className="mb-1">
              <label className="block text-xs font-semibold text-gray-500 mb-2">새 비밀번호</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                placeholder="새 비밀번호 입력"
                className="w-full border-2 border-sky-200 focus:border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/40"
                autoFocus
              />
            </div>
            {pwError && <p className="text-red-400 text-xs mt-2">{pwError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPwModal(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium"
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={pwSaving}
                className="flex-1 py-2.5 bg-[#1e3a5f] hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                {pwSaving ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
