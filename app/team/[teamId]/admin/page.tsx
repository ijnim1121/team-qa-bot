'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Document, Team } from '@/types'

const SOURCE_ICONS: Record<string, string> = {
  pdf: '📄',
  word: '📝',
  text: '✏️',
  url: '🔗',
}

const SOURCE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  word: 'Word/한글',
  text: '텍스트',
  url: 'URL',
}

const SOURCE_COLORS: Record<string, string> = {
  pdf: 'bg-red-50 text-red-400 border-red-100',
  word: 'bg-blue-50 text-blue-400 border-blue-100',
  text: 'bg-green-50 text-green-400 border-green-100',
  url: 'bg-purple-50 text-purple-400 border-purple-100',
}

export default function TeamAdminPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [teamId])

  async function fetchData() {
    const [teamRes, docsRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', teamId).single(),
      supabase.from('documents').select('*').eq('team_id', teamId).order('created_at', { ascending: false }),
    ])
    if (!teamRes.data) {
      router.push('/')
      return
    }
    setTeam(teamRes.data)
    setDocuments(docsRes.data || [])
    setLoading(false)
  }

  async function deleteDocument(docId: string) {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return
    setDeleting(docId)
    await supabase.from('documents').delete().eq('id', docId)
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    setDeleting(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <header className="bg-[#1e3a5f] text-white px-5 py-3.5 shadow-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/team/${teamId}`)}
            className="text-sky-200 hover:text-white transition-colors hover:scale-110 active:scale-95 text-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold">문서 관리</h1>
            {team && <p className="text-xs text-sky-300">{team.name}</p>}
          </div>
        </div>
        <button
          onClick={() => router.push(`/team/${teamId}/admin/add`)}
          className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all duration-200 font-semibold border border-white/20"
        >
          + 문서 추가
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {loading ? (
          <div className="text-center text-sky-400 py-20 text-sm animate-pulse">불러오는 중...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">📂</div>
            <p className="text-gray-600 font-semibold">등록된 문서가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">
              문서를 추가하면 AI가 해당 내용을 기반으로 답변합니다
            </p>
            <button
              onClick={() => router.push(`/team/${teamId}/admin/add`)}
              className="mt-6 px-6 py-3 bg-[#1e3a5f] hover:bg-sky-600 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              첫 문서 추가하기
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">총 {documents.length}개 문서</p>
            <div className="flex flex-col gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${SOURCE_COLORS[doc.source_type]} flex-shrink-0`}>
                      {SOURCE_ICONS[doc.source_type]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {SOURCE_LABELS[doc.source_type]} · {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    disabled={deleting === doc.id}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 whitespace-nowrap transition-colors px-2 py-1 hover:bg-red-50 rounded-lg"
                  >
                    {deleting === doc.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
