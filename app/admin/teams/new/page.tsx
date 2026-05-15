'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CHARACTER_LIST, CharacterKey } from '@/components/TeamCharacter'

export default function NewTeamPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [character, setCharacter] = useState<CharacterKey>('robot')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !password.trim()) {
      setError('팀 이름과 비밀번호는 필수입니다')
      return
    }

    setSaving(true)
    const { error: dbError } = await supabase.from('teams').insert({
      name: name.trim(),
      description: description.trim(),
      password: password.trim(),
      character,
    })

    if (dbError) {
      setError('저장 중 오류가 발생했습니다: ' + dbError.message)
      setSaving(false)
      return
    }

    router.push('/')
  }

  const inputClass =
    'w-full border-2 border-sky-200 focus:border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/40'

  const selectedCharacter = CHARACTER_LIST.find((c) => c.key === character)!

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <header className="bg-[#1e3a5f] text-white py-5 px-6 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-sky-200 hover:text-white text-sm transition-colors hover:scale-110 active:scale-95 inline-block"
          >
            ← 돌아가기
          </button>
          <h1 className="text-xl font-bold">새 팀 추가</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤝</div>
          <p className="text-gray-500 text-sm">새로운 팀을 등록하고 전용 Q&A 봇을 만들어보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-sky-100 p-8 flex flex-col gap-6">
          {/* 캐릭터 선택 */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a5f] mb-3">팀 캐릭터 선택</label>
            <div className="grid grid-cols-5 gap-2">
              {CHARACTER_LIST.map(({ key, label, Component }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCharacter(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    character === key
                      ? 'border-[#1e3a5f] bg-sky-50 scale-[1.05] shadow-md'
                      : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                >
                  <Component size={44} />
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                </button>
              ))}
            </div>
            {/* 선택된 캐릭터 미리보기 */}
            <div className="mt-4 flex items-center gap-3 bg-sky-50 rounded-2xl px-4 py-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <selectedCharacter.Component size={32} />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-[#1e3a5f]">{selectedCharacter.label}</span> 캐릭터가 선택됐습니다
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
              팀 이름 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 기술지원팀 연계개발"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">팀 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="팀에 대한 간단한 설명을 입력하세요"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
              입장 비밀번호 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 설정"
                className={`${inputClass} pr-11`}
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
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#1e3a5f] hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-sm mt-2"
          >
            {saving ? '저장 중...' : '팀 저장하기'}
          </button>
        </form>
      </div>
    </main>
  )
}
