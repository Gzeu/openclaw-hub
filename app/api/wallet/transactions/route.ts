import { NextRequest, NextResponse } from 'next/server'
import { getAccountTransactions } from '@/lib/multiversx'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  const size = parseInt(req.nextUrl.searchParams.get('size') ?? '20')

  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }

  const transactions = await getAccountTransactions(address, size)
  return NextResponse.json({ transactions })
}
