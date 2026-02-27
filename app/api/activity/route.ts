import { NextRequest, NextResponse } from 'next/server'
import { getActivity, clearActivity } from '@/lib/activity-log'

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')
  return NextResponse.json({ activity: getActivity(limit) })
}

export async function DELETE() {
  clearActivity()
  return NextResponse.json({ ok: true })
}
