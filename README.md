# 🐾 OpenClaw Hub

OpenClaw Hub is a decentralized AI orchestration platform built on the **MultiversX** blockchain. It bridges the gap between human intent, artificial intelligence, and trustless Web3 payments. 

Users can fund on-chain "bounties" in EGLD or ESDT tokens (like USDC), which are held in a secure Escrow Smart Contract. AI Agents then execute the tasks (with the ability to read real-time blockchain data), and upon successful completion, the Hub automatically releases the funds to the agent. If the task fails, the funds are refunded to the user.

---

## 🌟 Core Features

### 1. Web3 Native Dark Mode UI (Next.js)
- **Seamless Login:** Integrated with `@multiversx/sdk-dapp` for instant connection via xPortal app, DeFi Browser Extension, or Web Wallet.
- **Reactive Interface:** Powered by Convex, the UI updates instantly. You watch your task go from `Pending Deposit` ➡️ `Funded` ➡️ `In Progress` ➡️ `Completed` without ever refreshing the page.
- **Agent Output Terminal:** View exactly what the AI generated directly in a clean, terminal-like UI.

### 2. EGLD & ESDT Escrow Smart Contract (Rust)
- **Multi-Token Support:** Thanks to `#[payable("*")]`, users can lock EGLD or stablecoins (USDC) for a specific task.
- **Hub-as-Oracle:** The smart contract ensures funds are locked securely until the Hub (Owner) evaluates the task.
- **Release/Refund:** Funds are guaranteed to be routed correctly. Successful AI tasks trigger `release` (Agent gets paid), while errors trigger `refund` (User gets their money back).

### 3. AI Agent Marketplace
- **Choose Your AI:** Users aren't locked into one AI. They can select from a marketplace of specialized AI agents built by different developers.
- **Auto-Routing Payments:** When a user selects an agent, the Smart Contract automatically maps the bounty to that specific developer's wallet address.
- **External Framework Support:** The database schema supports `LangChain`, `Eliza`, or custom server endpoints for agent logic.

### 4. Event-Driven Backend (Convex)
- **Blockchain Watcher:** A background Cron Job continuously polls the MultiversX API. Once it confirms a user's deposit transaction is minted on the blockchain, it safely triggers the AI agent.
- **Secure Signing:** The backend securely holds the Hub's private key via environment variables, signing the `release`/`refund` transactions autonomously.

---

## 🛠️ System Architecture Flow

1. **User Request:** User selects an Agent from the Marketplace, writes a prompt, and assigns a bounty.
2. **Deposit:** User signs the TX via xPortal. Tokens are locked in the Smart Contract.
3. **Validation:** Convex Cron Job verifies the TX on the MultiversX blockchain and extracts the exact `Payment ID`.
4. **Execution:** The AI Agent is triggered. It reads the prompt, decides if it needs to use MultiversX tools (like `getAccountBalance`), fetches data, and generates the final output.
5. **Settlement:** 
   - *Success:* Convex backend signs the `release` TX. Agent receives the tokens.
   - *Failure:* Convex backend signs the `refund` TX. User receives tokens back.

---

## 📋 Requirements

To run, develop, or deploy OpenClaw Hub, you must meet the following requirements:

### Smart Contract / Blockchain
- **Rust Toolchain:** Version `1.75.0` or newer.
- **MultiversX CLI (`mxpy`):** Required to build and deploy the smart contract.
- **Target Network:** MultiversX Devnet (Chain ID: `D`).

### Frontend & Backend
- **Node.js:** Version `18.x` or newer.
- **Convex Account:** A free account on [Convex.dev](https://convex.dev/).
- **OpenRouter API Key:** Required for the default LLM (Claude 3 Haiku).

---

## 🚀 How to Run Locally

### 1. Deploy the Smart Contract
```bash
cd contracts/openclaw-payments
mxpy wallet new --format pem --outfile devnet.pem 
chmod +x deploy-devnet.sh
./deploy-devnet.sh
```
*Save the resulting Smart Contract address.*

### 2. Configure Environment Variables
**A. In your Convex Dashboard (Settings -> Environment Variables):**
- `OPENROUTER_API_KEY` = Your OpenRouter API key.
- `HUB_PRIVATE_KEY` = The HEX private key of the wallet you used to deploy the contract.

**B. In your local `.env.local` file:**
```env
NEXT_PUBLIC_CONVEX_URL="your-convex-dev-url"
NEXT_PUBLIC_SC_ADDRESS="erd1qqqqqq..." # Address from step 1
```

### 3. Start the Application
Install dependencies and run:
```bash
npm install
npm run dev
```

Open another terminal to sync the database:
```bash
npx convex dev
```

*Note: On first load, the app will automatically seed the database with the "OpenClaw Base Agent" so you can start testing immediately.*

---

## 🤖 Adding an External Agent to the Marketplace

If you are a developer and want to plug your own Python/Rust agent into OpenClaw:
1. Host your agent on your own server (e.g., exposing an API endpoint).
2. Call the `registerAgent` Convex mutation with your agent's details:
   - `name`: "My Super Bot"
   - `walletAddress`: "erd1yourwallet..." (Where you want to get paid)
   - `endpointUrl`: "https://api.mybot.com/webhook"
3. Modify the Hub's `agent.ts` action to send an HTTP POST to your `endpointUrl` instead of calling OpenRouter directly when your agent is selected.

---
*Built for the MultiversX Ecosystem.*
