'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Document, Team } from '@/types'

const SOURCE_ICONS: Record<string, string> = {
  pdf: '📄', word: '📝', text: '✏️', url: '🔗',
}
const SOURCE_LABELS: Record<string, string> = {
  pdf: 'PDF', word: 'Word/한글', text: '텍스트', url: 'URL',
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [viewDoc, setViewDoc] = useState<Document | null>(null)

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem('adminAuth') === 'true')
    fetchData()
  }, [teamId])

  async function fetchData() {
    const [teamRes, docsRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', teamId).single(),
      supabase.from('documents').select('*').eq('team_id', teamId).order('created_at', { ascending: false }),
    ])
    if (!teamRes.data) { router.push('/'); return }
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
        {!isAdmin && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
            <p className="text-xs text-amber-700">🔒 문서 삭제는 관리자만 가능합니다</p>
            <button
              onClick={() => router.push('/')}
              className="text-xs text-amber-600 hover:text-amber-800 font-semibold underline underline-offset-2 transition-colors"
            >
              관리자 로그인
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-sky-400 py-20 text-sm animate-pulse">불러오는 중...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">📂</div>
            <p className="text-gray-600 font-semibold">등록된 문서가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">문서를 추가하면 AI가 해당 내용을 기반으로 답변합니다</p>
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
                  className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow duration-200"
                >
                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${SOURCE_COLORS[doc.source_type]} flex-shrink-0`}>
                    {SOURCE_ICONS[doc.source_type]}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {SOURCE_LABELS[doc.source_type]} · {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* PDF/Word: 다운로드 */}
                    {(doc.source_type === 'pdf' || doc.source_type === 'word') && doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-xs px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-lg transition-colors font-medium"
                      >
                        다운로드
                      </a>
                    )}
                    {/* 텍스트: 내용 보기 */}
                    {doc.source_type === 'text' && (
                      <button
                        onClick={() => setViewDoc(doc)}
                        className="text-xs px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-lg transition-colors font-medium"
                      >
                        내용 보기
                      </button>
                    )}
                    {/* URL: 링크 열기 */}
                    {doc.source_type === 'url' && doc.source_url && (
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg transition-colors font-medium"
                      >
                        링크 열기
                      </a>
                    )}
                    {/* 삭제 (관리자만) */}
                    {isAdmin && (
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        disabled={deleting === doc.id}
                        className="text-xs px-2.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg disabled:opacity-40 transition-colors font-medium"
                      >
                        {deleting === doc.id ? '삭제 중...' : '삭제'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 텍스트 내용 보기 모달 */}
      {viewDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setViewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-sky-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#1e3a5f]">{viewDoc.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(viewDoc.created_at).toLocaleDateString('ko-KR')} 등록
                </p>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewDoc.content}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
