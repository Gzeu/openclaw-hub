import { 
  Address,
  Transaction,
  TransactionPayload,
  Account,
  TokenTransfer
} from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

// URL-ul MultiversX Devnet API
const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com", {
  timeout: 10000,
});

// Adresa de devnet a contractului compilat anterior
const SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS || "erd1qqqqqqqqqqqqqpgq...inlocuieste_cu_sc_address";

/**
 * Funcție folosită de OpenClaw Hub pentru a apela endpoint-ul de `release` 
 * din Smart Contract, trimițând banii din escrow către Agent.
 */
export async function releaseEscrowFunds(paymentId: number): Promise<string> {
  // 1. Încărcăm portofelul privat al Hub-ului (Owner-ul SC-ului)
  // Cheia privată HEX sau PEM text trebuie stocată în Environment Variables în Convex
  const privateKeyHex = process.env.HUB_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error("Missing HUB_PRIVATE_KEY in environment variables.");
  }

  // Generăm signer-ul din hex (presupunând că ai extras cheia din PEM sub formă de hex)
  const signer = UserSigner.fromHex(privateKeyHex);
  const hubAddress = signer.getAddress();
  
  console.log(`Hub Wallet initialized: ${hubAddress.bech32()}`);

  // 2. Sincronizăm starea account-ului (pentru a obține nonce-ul corect)
  const accountOnNetwork = await networkProvider.getAccount(hubAddress);
  const hubAccount = new Account(hubAddress);
  hubAccount.update(accountOnNetwork);

  // 3. Construim payload-ul pentru funcția `release`
  // payment_id e u64, deci trebuie transformat într-un hex par. (ex: 1 -> "01")
  let paymentIdHex = paymentId.toString(16);
  if (paymentIdHex.length % 2 !== 0) {
    paymentIdHex = "0" + paymentIdHex;
  }
  
  const payload = new TransactionPayload(`release@${paymentIdHex}`);

  // 4. Creăm tranzacția
  const tx = new Transaction({
    nonce: hubAccount.nonce,
    sender: hubAddress,
    receiver: new Address(SC_ADDRESS),
    value: TokenTransfer.egldFromAmount("0"), // Nu trimitem EGLD, doar executăm funcția
    gasLimit: 10000000,
    data: payload,
    chainID: "D"
  });

  // 5. Semnăm tranzacția cu cheia privată a Hub-ului
  const signature = await signer.sign(tx.serializeForSigning());
  tx.applySignature(signature);

  // 6. O trimitem spre rețeaua MultiversX
  const txHash = await networkProvider.sendTransaction(tx);
  
  return txHash;
}
