// 팀별 캐릭터 컴포넌트
// 새 팀 추가 시 여기에 캐릭터를 추가하세요

interface CharacterProps {
  size?: number
}

// 기술지원팀 연계개발 - 로봇 캐릭터
export function RobotCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 안테나 */}
      <line x1="40" y1="8" x2="40" y2="18" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="6" r="4" fill="#56b8e6" />

      {/* 머리 */}
      <rect x="18" y="18" width="44" height="34" rx="10" fill="#1e3a5f" />

      {/* 눈 왼쪽 */}
      <rect x="24" y="26" width="13" height="10" rx="4" fill="#56b8e6" />
      <circle cx="30" cy="31" r="3" fill="white" />

      {/* 눈 오른쪽 */}
      <rect x="43" y="26" width="13" height="10" rx="4" fill="#56b8e6" />
      <circle cx="49" cy="31" r="3" fill="white" />

      {/* 입 */}
      <rect x="28" y="40" width="24" height="6" rx="3" fill="#56b8e6" />
      <rect x="31" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />
      <rect x="37" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />
      <rect x="43" y="42" width="4" height="2" rx="1" fill="#1e3a5f" />

      {/* 몸통 */}
      <rect x="22" y="54" width="36" height="22" rx="8" fill="#2a4f7a" />

      {/* 배꼽(버튼) */}
      <circle cx="40" cy="63" r="4" fill="#56b8e6" />
      <circle cx="40" cy="63" r="2" fill="#1e3a5f" />

      {/* 팔 왼쪽 */}
      <rect x="10" y="55" width="10" height="18" rx="5" fill="#1e3a5f" />
      {/* 팔 오른쪽 */}
      <rect x="60" y="55" width="10" height="18" rx="5" fill="#1e3a5f" />

      {/* 다리 왼쪽 */}
      <rect x="26" y="74" width="10" height="6" rx="3" fill="#1e3a5f" />
      {/* 다리 오른쪽 */}
      <rect x="44" y="74" width="10" height="6" rx="3" fill="#1e3a5f" />
    </svg>
  )
}

// 기본 캐릭터 - 귀여운 별 (나중에 팀 추가 시 활용)
export function StarCharacter({ size = 80 }: CharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 별 몸통 */}
      <polygon
        points="40,8 48,30 72,30 54,46 60,70 40,56 20,70 26,46 8,30 32,30"
        fill="#f59e42"
        stroke="#e07b10"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 눈 */}
      <circle cx="33" cy="34" r="3" fill="#1e3a5f" />
      <circle cx="47" cy="34" r="3" fill="#1e3a5f" />
      {/* 빛 */}
      <circle cx="34" cy="33" r="1" fill="white" />
      <circle cx="48" cy="33" r="1" fill="white" />
      {/* 입 */}
      <path d="M34 42 Q40 48 46 42" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// 팀 이름으로 캐릭터 선택하는 헬퍼
export function getTeamCharacter(teamName: string): React.FC<CharacterProps> {
  if (teamName.includes('기술지원') || teamName.includes('연계개발') || teamName.includes('개발')) {
    return RobotCharacter
  }
  // 기본값
  return StarCharacter
}
