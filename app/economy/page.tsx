'use client'

import { useState } from 'react'
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks'
import { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI'
import { logout } from '@multiversx/sdk-dapp/utils'
import { Wallet, LogOut, ArrowRightRight, Cpu, ShieldCheck, Zap } from 'lucide-react'

export default function EconomyPage() {
  const { address, account } = useGetAccountInfo()
  const { isLoggedIn } = useGetLoginInfo()
  
  const [amountToDeposit, setAmountToDeposit] = useState('1.5')

  // Helper formatting for address
  const truncateAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Format EGLD balance (comes in atomic units - 18 decimals)
  const formatBalance = (balanceStr: string) => {
    if (!balanceStr || balanceStr === '0') return '0.00'
    const balance = parseFloat(balanceStr) / Math.pow(10, 18)
    return balance.toFixed(4)
  }

  const handleLogout = () => {
    // Redirect to home after logout
    logout('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Wallet className="text-[#23F7DD]" size={32} />
          Agent Economy & Decentralized Payments
        </h1>
        <p className="text-gray-400">
          Connect your MultiversX wallet to fund your OpenClaw Hub agents, pay for premium AI models, and participate in the decentralized agent marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet Connection & Balance */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#23F7DD]" />
              Wallet Status
            </h2>

            {!isLoggedIn ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-6">
                  Connect securely via MultiversX to unlock economic features.
                </p>
                <div className="flex flex-col gap-3">
                  <ExtensionLoginButton 
                    callbackRoute="/economy"
                    buttonClassName="!bg-[#1a1a1a] !text-white !border !border-[#333] hover:!border-[#23F7DD] !rounded-lg !py-3 !w-full !flex !justify-center transition-colors"
                    loginButtonText="DeFi Wallet Extension"
                  />
                  <WebWalletLoginButton 
                    callbackRoute="/economy"
                    buttonClassName="!bg-[#1a1a1a] !text-white !border !border-[#333] hover:!border-[#23F7DD] !rounded-lg !py-3 !w-full !flex !justify-center transition-colors"
                    loginButtonText="Web Wallet"
                  />
                  <WalletConnectLoginButton 
                    callbackRoute="/economy"
                    buttonClassName="!bg-[#1a1a1a] !text-white !border !border-[#333] hover:!border-[#23F7DD] !rounded-lg !py-3 !w-full !flex !justify-center transition-colors"
                    loginButtonText="xPortal App"
                  />
                  <LedgerLoginButton 
                    callbackRoute="/economy"
                    buttonClassName="!bg-[#1a1a1a] !text-white !border !border-[#333] hover:!border-[#23F7DD] !rounded-lg !py-3 !w-full !flex !justify-center transition-colors"
                    loginButtonText="Ledger Hardware"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <div className="text-xs text-gray-500 mb-1">Connected Address</div>
                  <div className="font-mono text-sm break-all text-[#23F7DD]">
                    {address}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-lg border border-[#333]">
                  <div className="text-xs text-gray-500 mb-1">Available Balance</div>
                  <div className="text-3xl font-bold">
                    {formatBalance(account?.balance)} <span className="text-sm font-normal text-gray-400">EGLD</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Funding & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`bg-[#111] border border-[#1e1e1e] rounded-xl p-6 relative overflow-hidden ${!isLoggedIn ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {!isLoggedIn && (
              <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-[#1a1a1a] border border-[#333] px-6 py-3 rounded-lg shadow-xl text-sm">
                  Please connect your wallet to manage agent funds
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-[#23F7DD]" />
              Fund Agent Workspace
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Deposit EGLD into your agent's smart contract escrow. This balance is used automatically by your autonomous agents to pay for API usage, model inference, and delegated tasks.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Deposit Amount (EGLD)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={amountToDeposit}
                        onChange={(e) => setAmountToDeposit(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-4 pr-16 py-3 text-white focus:outline-none focus:border-[#23F7DD] transition-colors"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">EGLD</span>
                    </div>
                  </div>

                  <button className="w-full bg-[#23F7DD] text-black font-semibold py-3 rounded-lg hover:bg-[#23F7DD]/90 transition-colors flex items-center justify-center gap-2">
                    <ArrowRightRight size={18} />
                    Confirm Deposit
                  </button>
                  <p className="text-xs text-center text-gray-600">
                    Smart Contract transaction will be requested via your connected wallet.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-5 border border-[#333] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <Cpu size={16} />
                    Active Escrow Balance
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    0.0000 <span className="text-lg text-gray-500 font-normal">EGLD</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Estimated runway: ~0 API calls
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#333]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Today's Usage</span>
                    <span className="text-white">0.00 EGLD</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Active Delegations</span>
                    <span className="text-white">0 tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#23F7DD]/10 to-transparent border border-[#23F7DD]/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">How the OpenClaw Economy Works</h3>
            <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
              <li>Your funds are locked in a secure MultiversX smart contract.</li>
              <li>Agents request micropayments only when executing specific skills or API calls.</li>
              <li>You can withdraw unspent funds back to your wallet at any time.</li>
              <li>Future updates will support ESDT tokens (like USDC) and custom agent tokens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}