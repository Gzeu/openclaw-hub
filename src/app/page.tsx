"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
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
  const createTask = useMutation(api.tasks.createTask);
  const attachTxHashToTask = useMutation(api.tasks.attachTxHashToTask);
  
  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("0.1"); // EGLD
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Hook magic din MultiversX SDK care urmareste in timp real starea tranzactiei semnate
  const transactionStatus = useTrackTransactionStatus({
    transactionId: currentSessionId,
  });

  // Efect reactiv: ce facem cand tranzactia a reusit pe blockchain
  useEffect(() => {
    if (transactionStatus.isSuccessful && currentTaskId && transactionStatus.transactions && transactionStatus.transactions.length > 0) {
      console.log("Transaction successfully minted on chain!");
      
      // Hash-ul real al tranzacției pe blockchain (nu session id)
      const realTxHash = transactionStatus.transactions[0].hash;
      
      // Trimitem hash-ul real catre backend-ul Convex pentru verificare
      attachTxHashToTask({
        taskId: currentTaskId as any, // Convex ID
        txHashDeposit: realTxHash,
      }).then(() => {
        // Resetam state-ul pentru a permite un nou task
        setCurrentSessionId(null);
        setCurrentTaskId(null);
        setIsProcessing(false);
        refreshAccount();
      });
    } else if (transactionStatus.isFailed || transactionStatus.isCancelled) {
      console.error("Transaction failed or was cancelled by user");
      setCurrentSessionId(null);
      setCurrentTaskId(null);
      setIsProcessing(false);
    }
  }, [transactionStatus.isSuccessful, transactionStatus.isFailed, transactionStatus.isCancelled]);

  const handleCreateAndDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isLoggedIn) return;
    
    try {
      setIsProcessing(true);
      
      const taskId = await createTask({
        creatorAddress: address,
        prompt,
        escrowAmount: amount,
      });
      
      const dummyAgentAddress = address; // Fallback for dev
      
      const tx = buildDepositTransaction({
        sender: address,
        payeeAddress: dummyAgentAddress,
        amountEgld: amount,
        taskIdStr: taskId,
        nonce: account.nonce,
      });

      const { sessionId, error } = await sendTransactions({
        transactions: tx,
        transactionsDisplayInfo: {
          processingMessage: 'Processing Escrow Deposit',
          errorMessage: 'Escrow Deposit failed',
          successMessage: 'Escrow Deposit successful'
        },
        redirectAfterSign: false
      });

      if (error || !sessionId) {
        console.error("User cancelled or transaction failed:", error);
        setIsProcessing(false);
        return;
      }

      // Salvam sessionId pentru ca hook-ul `useTrackTransactionStatus` sa inceapa sa urmareasca
      setCurrentSessionId(sessionId);
      setCurrentTaskId(taskId);
      setPrompt("");

    } catch (err) {
      console.error("Error flow:", err);
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'funded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">OpenClaw</h1>
          <p className="text-sm text-gray-500 mt-1">Decentralized AI Agent Orchestration</p>
        </div>
        
        <div>
          {!isLoggedIn ? (
            <div className="flex gap-3">
              <ExtensionLoginButton
                callbackRoute="/"
                buttonClassName="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                loginButtonText="DeFi Wallet"
              />
              <WebWalletLoginButton
                callbackRoute="/"
                buttonClassName="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors shadow-sm"
                loginButtonText="Web Wallet"
              />
            </div>
          ) : (
            <div className="bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-mono text-sm font-medium text-gray-700">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CREATE TASK SECTION */}
        <section className="lg:col-span-4 h-fit sticky top-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-5 text-gray-900">Deploy an Agent</h2>
            <form onSubmit={handleCreateAndDeposit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Objective</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-inner bg-gray-50 focus:bg-white"
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g. Analyze the latest EGLD price trend and summarize..."
                  disabled={!isLoggedIn || isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Escrow Bounty (EGLD)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-gray-300 rounded-xl p-3 pl-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isLoggedIn || isProcessing}
                  />
                  <div className="absolute right-4 top-3 text-gray-400 text-sm font-medium pointer-events-none">EGLD</div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={!isLoggedIn || !prompt || isProcessing}
                className="w-full bg-black text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Executing tx...
                  </span>
                ) : (
                  isLoggedIn ? "Fund & Launch Agent" : "Connect Wallet to Start"
                )}
              </button>
            </form>
          </div>
        </section>

        {/* TASKS FEED SECTION */}
        <section className="lg:col-span-8">
          <h2 className="text-lg font-semibold mb-5 text-gray-900 flex items-center gap-2">
            Live Network Feed
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </h2>
          
          <div className="space-y-4">
            {tasks === undefined ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 h-32 animate-pulse flex flex-col justify-between">
                    <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No agents deployed yet. Be the first!</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{task.escrowAmount} EGLD</span>
                    </div>
                    {task.txHashDeposit && task.txHashDeposit !== "dummy-hash" && (
                      <a href={`https://devnet-explorer.multiversx.com/transactions/${task.txHashDeposit}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                        View Tx ↗
                      </a>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-4">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Objective</span>
                      <p className="text-sm text-gray-800 mt-1 font-medium">{task.prompt}</p>
                    </div>

                    {task.result && (
                      <div className="mt-4 bg-gray-900 rounded-xl p-4 relative group">
                        <span className="absolute -top-2.5 left-4 bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                          Agent Output
                        </span>
                        <div className="text-gray-300 text-sm font-mono whitespace-pre-wrap mt-1 max-h-64 overflow-y-auto custom-scrollbar">
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
