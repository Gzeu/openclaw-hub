import { 
  Address,
  Transaction,
  TransactionPayload,
  Account,
  TokenTransfer
} from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com", {
  timeout: 10000,
});

const SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS || "erd1qqqqqqqqqqqqqpgq...inlocuieste_cu_sc_address";

/**
 * Utilitar intern pentru a semna si trimite tranzactii pe SC cu portofelul Hub-ului
 */
async function executeHubTransaction(funcName: string, paymentId: number): Promise<string> {
  const privateKeyHex = process.env.HUB_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error("Missing HUB_PRIVATE_KEY in environment variables.");
  }

  const signer = UserSigner.fromHex(privateKeyHex);
  const hubAddress = signer.getAddress();
  
  const accountOnNetwork = await networkProvider.getAccount(hubAddress);
  const hubAccount = new Account(hubAddress);
  hubAccount.update(accountOnNetwork);

  let paymentIdHex = paymentId.toString(16);
  if (paymentIdHex.length % 2 !== 0) {
    paymentIdHex = "0" + paymentIdHex;
  }
  
  const payload = new TransactionPayload(`${funcName}@${paymentIdHex}`);

  const tx = new Transaction({
    nonce: hubAccount.nonce,
    sender: hubAddress,
    receiver: new Address(SC_ADDRESS),
    value: TokenTransfer.egldFromAmount("0"),
    gasLimit: 10000000,
    data: payload,
    chainID: "D"
  });

  const signature = await signer.sign(tx.serializeForSigning());
  tx.applySignature(signature);

  return await networkProvider.sendTransaction(tx);
}

/**
 * Plătește agentul (Eliberează EGLD din SC către Payee)
 */
export async function releaseEscrowFunds(paymentId: number): Promise<string> {
  return await executeHubTransaction("release", paymentId);
}

/**
 * Dă banii înapoi utilizatorului (Eliberează EGLD din SC înapoi către Payer)
 */
export async function refundEscrowFunds(paymentId: number): Promise<string> {
  return await executeHubTransaction("refund", paymentId);
}
