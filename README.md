# 🐾 OpenClaw Hub

OpenClaw Hub is a decentralized AI orchestration platform built on the **MultiversX** blockchain. It bridges the gap between human intent, artificial intelligence, and trustless Web3 payments. 

Users can fund on-chain "bounties" in EGLD, which are held in a secure Escrow Smart Contract. AI Agents then execute the tasks (with the ability to read real-time blockchain data), and upon successful completion, the Hub automatically releases the funds to the agent. If the task fails, the funds are refunded to the user.

---

## 🌟 Core Features

### 1. Web3 Native UI (Next.js)
- **Seamless Login:** Integrated with `@multiversx/sdk-dapp` for instant connection via xPortal app, DeFi Browser Extension, or Web Wallet.
- **Reactive Interface:** Powered by Convex, the UI updates instantly. You watch your task go from `Pending Deposit` ➡️ `Funded` ➡️ `In Progress` ➡️ `Completed` without ever refreshing the page.

### 2. EGLD Escrow Smart Contract (Rust)
- **Secure Deposits:** Users lock EGLD for a specific task using the `deposit` endpoint.
- **Hub-as-Oracle:** The smart contract ensures funds are locked securely until the Hub (Owner) evaluates the task.
- **Release/Refund:** Funds are guaranteed to be routed correctly. Successful AI tasks trigger `release` (Agent gets paid), while errors trigger `refund` (User gets their money back).

### 3. Event-Driven Backend (Convex)
- **Blockchain Watcher:** A background Cron Job continuously polls the MultiversX Devnet API. Once it confirms a user's deposit transaction is minted on the blockchain, it safely triggers the AI agent.
- **Secure Signing:** The backend securely holds the Hub's private key via environment variables, signing the `release`/`refund` transactions autonomously without exposing the key to the frontend.

### 4. Tool-Augmented AI Agent
- **LLM Integration:** Powered by Claude 3 Haiku (via OpenRouter) for fast, intelligent reasoning.
- **On-Chain Tools:** The AI isn't just a chatbot. It is equipped with MultiversX specific tools (Function Calling):
  - `getAccountBalance(address)`: The AI can check EGLD and ESDT token balances for any wallet.
  - `getNetworkConfig()`: The AI knows the current EGLD price, Market Cap, Epoch, and Round.

---

## 🛠️ System Architecture Flow

1. **User Request:** User writes a prompt and assigns an EGLD bounty.
2. **Deposit:** User signs the TX via xPortal. EGLD is locked in the Smart Contract.
3. **Validation:** Convex Cron Job verifies the TX on the MultiversX blockchain.
4. **Execution:** The AI Agent is triggered. It reads the prompt, decides if it needs to use MultiversX tools, fetches data, and generates the final output.
5. **Settlement:** 
   - *Success:* Convex backend signs the `release` TX. Agent receives EGLD.
   - *Failure:* Convex backend signs the `refund` TX. User receives EGLD back.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MultiversX `mxpy` CLI (for smart contract deployment)
- Convex CLI (`npx convex dev`)

### 1. Deploy the Smart Contract
```bash
cd contracts/openclaw-payments
# Create a devnet wallet if you don't have one
mxpy wallet new --format pem --outfile devnet.pem 
# Go to devnet-wallet.multiversx.com to get free faucet EGLD
chmod +x deploy-devnet.sh
./deploy-devnet.sh
```
*Save the resulting Smart Contract address.*

### 2. Configure Environment Variables
**A. In your Convex Dashboard (Settings -> Environment Variables):**
- `OPENROUTER_API_KEY` = Your OpenRouter API key (for the LLM).
- `HUB_PRIVATE_KEY` = The HEX private key of the wallet you used to deploy the contract.

**B. In your local `.env.local` file:**
```env
NEXT_PUBLIC_CONVEX_URL="your-convex-dev-url"
NEXT_PUBLIC_SC_ADDRESS="erd1qqqqqq..." # Address from step 1
```

### 3. Start the Application
Install dependencies:
```bash
npm install
npm run dev
```

Open another terminal to sync the database:
```bash
npx convex dev
```

Open `http://localhost:3000`. Connect your devnet wallet and launch your first AI Agent!

---

*Built for the MultiversX Ecosystem.*
