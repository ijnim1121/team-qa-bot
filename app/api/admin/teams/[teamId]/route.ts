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

// 팀 정보 변경 (password / name+description)
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/teams/[teamId]'>) {
  const { teamId } = await ctx.params
  const body = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {}
  if (body.password !== undefined) {
    if (!body.password.trim()) return NextResponse.json({ error: '비밀번호를 입력해주세요' }, { status: 400 })
    updates.password = body.password.trim()
  }
  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: '팀 이름을 입력해주세요' }, { status: 400 })
    updates.name = body.name.trim()
  }
  if (body.description !== undefined) {
    updates.description = body.description.trim()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다' }, { status: 400 })
  }

  const { error } = await supabase.from('teams').update(updates).eq('id', teamId)
  if (error) {
    return NextResponse.json({ error: '변경 실패: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
