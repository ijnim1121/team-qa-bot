import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: '비밀번호를 입력해주세요' }, { status: 400 })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '관리자 비밀번호가 올바르지 않습니다' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
