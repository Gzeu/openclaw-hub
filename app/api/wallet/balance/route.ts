import { NextRequest, NextResponse } from 'next/server'
import { getAgentBalance, getAccountTransactions } from '@/lib/multiversx'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }

  const [balance, transactions] = await Promise.all([
    getAgentBalance(address),
    getAccountTransactions(address, 5),
  ])

  return NextResponse.json({ address, balance, transactions })
}
