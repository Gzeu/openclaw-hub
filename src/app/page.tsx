"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks/account/useGetIsLoggedIn";
import { ExtensionLoginButton, WebWalletLoginButton } from "@multiversx/sdk-dapp/UI";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks/transactions/useTrackTransactionStatus";
import { buildDepositTransaction } from "@/utils/smartContract";

export default function Home() {
  const isLoggedIn = useGetIsLoggedIn();
  const { address, account } = useGetAccountInfo();
  
  const tasks = useQuery(api.tasks.getTasks, {});
  const activeAgents = useQuery(api.agents.getActiveAgents, {});
  const seedNativeAgent = useMutation(api.agents.seedNativeAgent);
  
  const createTask = useMutation(api.tasks.createTask);
  const attachTxHashToTask = useMutation(api.tasks.attachTxHashToTask);
  
  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("0.1"); // EGLD
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const hasSeeded = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const transactionStatus = useTrackTransactionStatus({
    transactionId: currentSessionId,
  });

  useEffect(() => {
    if (transactionStatus.isSuccessful && currentTaskId && transactionStatus.transactions && transactionStatus.transactions.length > 0) {
      const realTxHash = transactionStatus.transactions[0].hash;
      attachTxHashToTask({
        taskId: currentTaskId as any,
        txHashDeposit: realTxHash,
      }).then(() => {
        setCurrentSessionId(null);
        setCurrentTaskId(null);
        setIsProcessing(false);
        setPrompt("");
        refreshAccount();
      });
    } else if (transactionStatus.isFailed || transactionStatus.isCancelled) {
      setCurrentSessionId(null);
      setCurrentTaskId(null);
      setIsProcessing(false);
    }
  }, [transactionStatus.isSuccessful, transactionStatus.isFailed, transactionStatus.isCancelled]);

  // Auto-seed mechanism and default selection
  useEffect(() => {
    if (activeAgents !== undefined && activeAgents.length === 0 && !hasSeeded.current) {
      hasSeeded.current = true;
      seedNativeAgent().catch(console.error);
    }
    
    if (activeAgents && activeAgents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(activeAgents[0]._id);
    }
  }, [activeAgents, selectedAgentId, seedNativeAgent]);

  const handleCreateAndDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isLoggedIn || !selectedAgentId) return;
    
    try {
      setIsProcessing(true);
      
      const selectedAgent = activeAgents?.find(a => a._id === selectedAgentId);
      const agentWalletAddress = selectedAgent?.walletAddress || address; 
      
      const taskId = await createTask({
        creatorAddress: address,
        agentId: selectedAgentId as any,
        prompt,
        escrowAmount: amount,
      });
      
      const tx = buildDepositTransaction({
        sender: address,
        payeeAddress: agentWalletAddress,
        amountEgld: amount,
        taskIdStr: taskId,
        nonce: account.nonce,
      });

      const { sessionId, error } = await sendTransactions({
        transactions: tx,
        transactionsDisplayInfo: {
          processingMessage: 'Deploying Agent...',
          errorMessage: 'Deployment failed',
          successMessage: 'Agent deployed successfully!'
        },
        redirectAfterSign: false
      });

      if (error || !sessionId) {
        setIsProcessing(false);
        return;
      }

      setCurrentSessionId(sessionId);
      setCurrentTaskId(taskId);

    } catch (err) {
      console.error("Error flow:", err);
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in_progress': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 pulse-glow';
      case 'funded': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'failed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              OpenClaw Hub
            </h1>
          </div>
          
          <div>
            {!isLoggedIn ? (
              <div className="flex gap-3">
                <ExtensionLoginButton
                  callbackRoute="/"
                  buttonClassName="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-white/5"
                  loginButtonText="DeFi Wallet"
                />
                <WebWalletLoginButton
                  callbackRoute="/"
                  buttonClassName="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25"
                  loginButtonText="Web Wallet"
                />
              </div>
            ) : (
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="font-mono text-sm font-medium text-gray-300">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-5 h-fit lg:sticky lg:top-28 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Agent Marketplace
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
              {activeAgents === undefined ? (
                <div className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>
              ) : activeAgents.map(agent => (
                <div 
                  key={agent._id}
                  onClick={() => setSelectedAgentId(agent._id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    selectedAgentId === agent._id 
                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                    : 'bg-[#121214] border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300">
                      v{agent.version || '1.0'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className="text-[10px] bg-black/50 text-indigo-300 px-2 py-1 rounded-md border border-indigo-500/20">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
            
            <h2 className="text-lg font-semibold mb-5 text-white">Deploy Objective</h2>
            <form onSubmit={handleCreateAndDeposit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Instructions for Agent</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-gray-200 placeholder-gray-600"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Analyze the EGLD token supply and provide a summary..."
                  disabled={!isLoggedIn || isProcessing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Escrow Bounty (EGLD)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pl-5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-200 font-mono"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isLoggedIn || isProcessing}
                  />
                  <div className="absolute right-5 top-4 text-gray-500 text-sm font-bold tracking-widest pointer-events-none">EGLD</div>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={!isLoggedIn || !prompt || isProcessing || !selectedAgentId}
                className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-gray-200 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Awaiting Signature...
                  </>
                ) : (
                  isLoggedIn ? "Fund Escrow & Launch" : "Connect Wallet to Start"
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Live Network Activity
              <span className="flex h-2.5 w-2.5 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {tasks === undefined ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="bg-[#121214] p-6 rounded-3xl border border-white/5 h-40 animate-pulse"></div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center p-16 bg-[#121214] rounded-3xl border border-dashed border-white/10">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <p className="text-gray-400 font-medium">No active tasks on the network.</p>
                <p className="text-sm text-gray-600 mt-1">Deploy an agent to see activity here.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="bg-[#121214] rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-white/10 group">
                  <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-mono text-gray-300 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                        {task.escrowAmount} EGLD
                      </span>
                    </div>
                    {task.txHashDeposit && task.txHashDeposit !== "dummy-hash" && (
                      <a href={`https://devnet-explorer.multiversx.com/transactions/${task.txHashDeposit}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tx ↗
                      </a>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-5">
                      <p className="text-sm text-gray-300 leading-relaxed">{task.prompt}</p>
                    </div>

                    {task.result && (
                      <div className="mt-2 bg-black/60 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Agent Output</span>
                        </div>
                        <div className="p-4 text-gray-300 text-sm font-mono whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar leading-relaxed">
                          {task.result}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
