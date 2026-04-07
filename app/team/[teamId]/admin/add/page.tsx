'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

type TabType = 'pdf' | 'word' | 'text' | 'url'

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'pdf', label: 'PDF', icon: '📄' },
  { key: 'word', label: 'Word/한글', icon: '📝' },
  { key: 'text', label: '텍스트', icon: '✏️' },
  { key: 'url', label: 'URL', icon: '🔗' },
]

export default function AddDocumentPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('pdf')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [url, setUrl] = useState('')
  const [urlTitle, setUrlTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputClass =
    'w-full border-2 border-sky-200 focus:border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors bg-sky-50/40'

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleSubmit() {
    setError('')
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('teamId', teamId)
      formData.append('sourceType', activeTab)

      if (activeTab === 'pdf' || activeTab === 'word') {
        if (!file) { setError('파일을 선택해주세요'); setSaving(false); return }
        formData.append('file', file)
      } else if (activeTab === 'text') {
        if (!textTitle.trim() || !textContent.trim()) {
          setError('제목과 본문을 모두 입력해주세요')
          setSaving(false)
          return
        }
        formData.append('title', textTitle.trim())
        formData.append('content', textContent.trim())
      } else if (activeTab === 'url') {
        if (!url.trim()) { setError('URL을 입력해주세요'); setSaving(false); return }
        formData.append('url', url.trim())
        formData.append('title', urlTitle.trim() || url.trim())
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '저장 중 오류가 발생했습니다')
        setSaving(false)
        return
      }

      router.push(`/team/${teamId}/admin`)
    } catch {
      setError('저장 중 오류가 발생했습니다')
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <header className="bg-[#1e3a5f] text-white px-5 py-3.5 shadow-xl flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/team/${teamId}/admin`)}
          className="text-sky-200 hover:text-white transition-colors hover:scale-110 active:scale-95 text-sm"
        >
          ←
        </button>
        <h1 className="text-base font-bold">문서 추가</h1>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-500 text-sm">문서를 추가하면 AI가 해당 내용을 기반으로 답변합니다</p>
        </div>

        {/* 탭 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setFile(null); setError('') }}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#1e3a5f] text-white shadow-md scale-[1.03]'
                  : 'bg-white text-gray-500 hover:bg-sky-50 border border-sky-100 hover:border-sky-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-6">
          {/* PDF 업로드 */}
          {activeTab === 'pdf' && (
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-[#1e3a5f] bg-sky-50 scale-[1.01]'
                  : 'border-sky-200 hover:border-sky-400 hover:bg-sky-50/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-5xl mb-3">📄</p>
              {file ? (
                <>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">클릭하여 다시 선택</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">PDF 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-gray-400 mt-1">.pdf 파일만 지원</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* Word/한글 업로드 */}
          {activeTab === 'word' && (
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-[#1e3a5f] bg-sky-50 scale-[1.01]'
                  : 'border-sky-200 hover:border-sky-400 hover:bg-sky-50/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-5xl mb-3">📝</p>
              {file ? (
                <>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">클릭하여 다시 선택</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">Word 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-gray-400 mt-1">.docx 파일 지원 (한글 .hwp 미지원)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* 텍스트 직접 입력 */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">문서 제목</label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">본문 내용</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="지식베이스에 등록할 내용을 입력하세요"
                  rows={10}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {/* URL 크롤링 */}
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">페이지 URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">문서 제목 (선택)</label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="비워두면 URL이 제목으로 사용됩니다"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full mt-6 py-3.5 bg-[#1e3a5f] hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-sm"
          >
            {saving ? '처리 중...' : '문서 저장하기'}
          </button>
        </div>
      </div>
    </main>
  )
}
