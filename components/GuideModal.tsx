'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'guide_dismissed'

interface Props {
  forceOpen?: boolean
  onClose?: () => void
}

const steps = [
  {
    icon: '🏠',
    title: '팀 선택',
    desc: '메인 화면에서 내가 속한 팀 카드를 찾아 "입장하기" 버튼을 누르세요.',
  },
  {
    icon: '🔑',
    title: '비밀번호 입력',
    desc: '팀 비밀번호를 입력하면 해당 팀의 AI 챗봇 화면으로 이동합니다.',
  },
  {
    icon: '💬',
    title: 'AI에게 질문하기',
    desc: '팀에 등록된 문서를 기반으로 AI가 답변해드려요. 업무 절차, 규정, 매뉴얼 등 뭐든 물어보세요!',
  },
  {
    icon: '📂',
    title: '문서 추가',
    desc: '우측 상단 메뉴에서 문서를 추가할 수 있어요. PDF, Word, 텍스트, URL 모두 지원합니다. 누구나 추가 가능해요.',
  },
  {
    icon: '🔐',
    title: '관리자 기능',
    desc: '팀 생성·삭제, 문서 삭제는 관리자만 가능해요. 메인 화면 우측 하단 "관리자" 버튼으로 로그인하세요.',
  },
]

export default function GuideModal({ forceOpen, onClose }: Props) {
  const [open, setOpen] = useState(false)
  const [isManual, setIsManual] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setOpen(true)
      setIsManual(false)
    }
  }, [])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      setIsManual(true)
    }
  }, [forceOpen])

  function close() {
    setOpen(false)
    onClose?.()
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
    onClose?.()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-sky-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-[#1e3a5f] px-6 py-5 text-white text-center">
          <div className="text-3xl mb-2">👋</div>
          <h2 className="text-lg font-extrabold">처음 오셨나요?</h2>
          <p className="text-sky-200 text-xs mt-1">사용 방법을 간단히 안내해드릴게요</p>
        </div>

        {/* 단계 목록 */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[55vh] overflow-y-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-lg flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1e3a5f]">
                  <span className="text-sky-400 mr-1">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={close}
            className="w-full py-3 bg-[#1e3a5f] hover:bg-sky-600 text-white rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-sm"
          >
            확인했어요
          </button>
          {!isManual && (
            <button
              onClick={dismiss}
              className="w-full py-2.5 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
            >
              다시 보지 않기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
