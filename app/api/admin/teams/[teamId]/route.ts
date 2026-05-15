import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 팀 삭제
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/teams/[teamId]'>) {
  const { teamId } = await ctx.params

  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) {
    return NextResponse.json({ error: '삭제 실패: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// 팀 비밀번호 변경
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/teams/[teamId]'>) {
  const { teamId } = await ctx.params
  const { password } = await req.json()

  if (!password?.trim()) {
    return NextResponse.json({ error: '비밀번호를 입력해주세요' }, { status: 400 })
  }

  const { error } = await supabase
    .from('teams')
    .update({ password: password.trim() })
    .eq('id', teamId)

  if (error) {
    return NextResponse.json({ error: '변경 실패: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
