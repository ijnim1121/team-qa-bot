interface CharacterProps {
  size?: number
}

// 🤖 로봇 - 기술/개발팀
export function RobotCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="8" x2="40" y2="18" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="6" r="4" fill="#56b8e6" />
      <rect x="18" y="18" width="44" height="34" rx="10" fill="#1e3a5f" />
      <rect x="24" y="26" width="13" height="10" rx="4" fill="#56b8e6" />
      <circle cx="30" cy="31" r="3" fill="white" />
      <rect x="43" y="26" width="13" height="10" rx="4" fill="#56b8e6" />
      <circle cx="49" cy="31" r="3" fill="white" />
      <rect x="28" y="40" width="24" height="6" rx="3" fill="#56b8e6" />
      <rect x="31" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />
      <rect x="37" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />
      <rect x="43" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />
      <rect x="22" y="54" width="36" height="22" rx="8" fill="#2a4f7a" />
      <circle cx="40" cy="63" r="4" fill="#56b8e6" />
      <circle cx="40" cy="63" r="2" fill="#1e3a5f" />
      <rect x="10" y="55" width="10" height="18" rx="5" fill="#1e3a5f" />
      <rect x="60" y="55" width="10" height="18" rx="5" fill="#1e3a5f" />
      <rect x="26" y="74" width="10" height="6" rx="3" fill="#1e3a5f" />
      <rect x="44" y="74" width="10" height="6" rx="3" fill="#1e3a5f" />
    </svg>
  )
}

// 📚 책 - 지식/교육팀
export function BookCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 책 몸통 */}
      <rect x="14" y="12" width="52" height="58" rx="6" fill="#f59e0b" />
      {/* 책 등 */}
      <rect x="14" y="12" width="10" height="58" rx="4" fill="#d97706" />
      {/* 페이지 선들 */}
      <line x1="30" y1="22" x2="58" y2="22" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="30" x2="58" y2="30" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="38" x2="58" y2="38" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
      {/* 얼굴 배경 */}
      <ellipse cx="44" cy="56" rx="16" ry="14" fill="#fef3c7" />
      {/* 눈 */}
      <circle cx="38" cy="53" r="3" fill="#1e3a5f" />
      <circle cx="50" cy="53" r="3" fill="#1e3a5f" />
      <circle cx="39" cy="52" r="1" fill="white" />
      <circle cx="51" cy="52" r="1" fill="white" />
      {/* 입 */}
      <path d="M38 61 Q44 66 50 61" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 볼터치 */}
      <ellipse cx="34" cy="58" rx="3" ry="2" fill="#fcd34d" opacity="0.6" />
      <ellipse cx="54" cy="58" rx="3" ry="2" fill="#fcd34d" opacity="0.6" />
    </svg>
  )
}

// 🚀 로켓 - 기획/성장팀
export function RocketCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 불꽃 */}
      <ellipse cx="40" cy="74" rx="8" ry="5" fill="#fbbf24" opacity="0.8" />
      <ellipse cx="40" cy="72" rx="5" ry="4" fill="#f97316" />
      {/* 로켓 몸통 */}
      <rect x="26" y="30" width="28" height="36" rx="6" fill="#6366f1" />
      {/* 노즈콘 */}
      <path d="M26 34 Q40 8 54 34 Z" fill="#818cf8" />
      {/* 날개 왼쪽 */}
      <path d="M26 52 L14 66 L26 62 Z" fill="#4f46e5" />
      {/* 날개 오른쪽 */}
      <path d="M54 52 L66 66 L54 62 Z" fill="#4f46e5" />
      {/* 창문 */}
      <circle cx="40" cy="44" r="10" fill="#e0e7ff" />
      <circle cx="40" cy="44" r="8" fill="#c7d2fe" />
      {/* 얼굴 */}
      <circle cx="37" cy="42" r="2.5" fill="#1e3a5f" />
      <circle cx="43" cy="42" r="2.5" fill="#1e3a5f" />
      <circle cx="37.8" cy="41.2" r="0.8" fill="white" />
      <circle cx="43.8" cy="41.2" r="0.8" fill="white" />
      <path d="M36 47 Q40 50 44 47" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// 💬 말풍선 - 고객지원/소통팀
export function ChatCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 말풍선 꼬리 */}
      <path d="M24 62 L16 74 L36 64 Z" fill="#10b981" />
      {/* 말풍선 몸통 */}
      <rect x="8" y="10" width="64" height="56" rx="20" fill="#10b981" />
      {/* 얼굴 배경 */}
      <ellipse cx="40" cy="38" rx="22" ry="20" fill="#d1fae5" />
      {/* 눈 */}
      <circle cx="32" cy="34" r="3.5" fill="#065f46" />
      <circle cx="48" cy="34" r="3.5" fill="#065f46" />
      <circle cx="33" cy="33" r="1.2" fill="white" />
      <circle cx="49" cy="33" r="1.2" fill="white" />
      {/* 미소 */}
      <path d="M30 43 Q40 52 50 43" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* 볼터치 */}
      <ellipse cx="26" cy="40" rx="4" ry="2.5" fill="#6ee7b7" opacity="0.7" />
      <ellipse cx="54" cy="40" rx="4" ry="2.5" fill="#6ee7b7" opacity="0.7" />
    </svg>
  )
}

// ⭐ 별 - 기본/기타팀
export function StarCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="40,8 48,30 72,30 54,46 60,70 40,56 20,70 26,46 8,30 32,30"
        fill="#f59e42" stroke="#e07b10" strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="33" cy="34" r="3" fill="#1e3a5f" />
      <circle cx="47" cy="34" r="3" fill="#1e3a5f" />
      <circle cx="34" cy="33" r="1" fill="white" />
      <circle cx="48" cy="33" r="1" fill="white" />
      <path d="M34 42 Q40 48 46 42" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="28" cy="39" rx="3" ry="2" fill="#fcd34d" opacity="0.6" />
      <ellipse cx="52" cy="39" rx="3" ry="2" fill="#fcd34d" opacity="0.6" />
    </svg>
  )
}

// 캐릭터 목록 (팀 생성 시 선택용)
export const CHARACTER_LIST = [
  { key: 'robot',  label: '로봇',    emoji: '🤖', Component: RobotCharacter },
  { key: 'book',   label: '책',      emoji: '📚', Component: BookCharacter },
  { key: 'rocket', label: '로켓',    emoji: '🚀', Component: RocketCharacter },
  { key: 'chat',   label: '말풍선',  emoji: '💬', Component: ChatCharacter },
  { key: 'star',   label: '별',      emoji: '⭐', Component: StarCharacter },
] as const

export type CharacterKey = typeof CHARACTER_LIST[number]['key']

// character 키로 컴포넌트 반환
export function getCharacterComponent(key?: string | null): React.FC<CharacterProps> {
  return CHARACTER_LIST.find((c) => c.key === key)?.Component ?? StarCharacter
}
