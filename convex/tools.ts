// Tool definitions for MultiversX Agent

const API_URL = "https://devnet-api.multiversx.com";

export async function executeTool(name: string, args: any): Promise<string> {
  console.log(`Executing Tool: ${name} with args:`, args);
  
  try {
    switch (name) {
      case "getAccountBalance":
        return await getAccountBalance(args.address);
      case "getNetworkConfig":
        return await getNetworkConfig();
      default:
        return JSON.stringify({ error: `Tool ${name} not recognized.` });
    }
  } catch (error: any) {
    console.error(`Tool execution error for ${name}:`, error);
    return JSON.stringify({ error: error.message || "Failed to execute tool" });
  }
}

async function getAccountBalance(address: string): Promise<string> {
  if (!address || !address.startsWith("erd1")) {
    return JSON.stringify({ error: "Invalid MultiversX address format. Must start with erd1." });
  }

  const [accountRes, tokensRes] = await Promise.all([
    fetch(`${API_URL}/accounts/${address}`),
    fetch(`${API_URL}/accounts/${address}/tokens?size=50`)
  ]);

  if (!accountRes.ok) {
    return JSON.stringify({ error: "Could not fetch account data. Address might not exist." });
  }

  const accountData = await accountRes.json();
  const tokensData = await tokensRes.json();

  // Convertim balanta in EGLD formatat (impartit la 10^18) ca sa nu faca AI-ul mate pe numere gigantice
  const egldBalance = (Number(accountData.balance) / 1e18).toFixed(4);

  return JSON.stringify({
    address: address,
    egldBalance: egldBalance,
    nonce: accountData.nonce,
    userName: accountData.username || null,
    tokens: tokensData.map((t: any) => ({
      identifier: t.identifier,
      name: t.name,
      balanceFormatted: (Number(t.balance) / Math.pow(10, t.decimals)).toFixed(2)
    }))
  });
}

async function getNetworkConfig(): Promise<string> {
  const [statsRes, econRes] = await Promise.all([
    fetch(`${API_URL}/stats`),
    fetch(`${API_URL}/economics`)
  ]);

  const stats = await statsRes.json();
  const econ = await econRes.json();

  return JSON.stringify({
    currentEpoch: stats.epoch,
    currentRound: stats.roundsPassed,
    egldPriceUsd: econ.price,
    totalStaked: (Number(econ.staked) / 1e18).toFixed(0),
    marketCap: econ.marketCap
  });
}
