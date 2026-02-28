"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks/account/useGetIsLoggedIn";
import { ExtensionLoginButton, WebWalletLoginButton } from "@multiversx/sdk-dapp/UI";

export default function Home() {
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  
  const tasks = useQuery(api.tasks.getTasks, {});
  const createTask = useMutation(api.tasks.createTask);
  
  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("0.1"); // EGLD

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    // 1. Salvăm intenția în Convex
    const taskId = await createTask({
      creatorAddress: address,
      prompt,
      escrowAmount: amount,
    });
    
    // Următorul pas (îl vom implementa): 
    // 2. Declanșăm tranzacția Smart Contract de deposit pe MultiversX
    console.log("Task created in Convex with ID:", taskId);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">OpenClaw Hub</h1>
        
        <div>
          {!isLoggedIn ? (
            <div className="flex gap-4">
              {/* Componente UI din @multiversx/sdk-dapp */}
              <ExtensionLoginButton
                callbackRoute="/"
                buttonClassName="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                loginButtonText="DeFi Wallet"
              />
              <WebWalletLoginButton
                callbackRoute="/"
                buttonClassName="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                loginButtonText="Web Wallet"
              />
            </div>
          ) : (
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-500">Connected: </span>
              <span className="font-mono font-medium">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formular creare Task */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Request AI Agent Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">What should the agent do?</label>
              <textarea 
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Write a python script to scrape..."
                disabled={!isLoggedIn}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bounty (EGLD)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isLoggedIn}
              />
            </div>
            <button 
              type="submit"
              disabled={!isLoggedIn || !prompt}
              className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggedIn ? "Fund Escrow & Create Task" : "Connect Wallet First"}
            </button>
          </form>
        </section>

        {/* Lista de task-uri din Convex */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Tasks (Live via Convex)</h2>
          <div className="space-y-3">
            {tasks === undefined ? (
              <div className="text-gray-500 animate-pulse">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 bg-gray-100 rounded-lg">No tasks yet.</div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {task.status.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{task.escrowAmount} EGLD</span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2">{task.prompt}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
