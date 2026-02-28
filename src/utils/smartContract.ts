import { 
  Address, 
  TokenTransfer, 
  Transaction, 
  TransactionPayload 
} from "@multiversx/sdk-core";

// TODO: Replace with the actual deployed contract address on devnet
const CONTRACT_ADDRESS = "erd1qqqqqqqqqqqqqpgq...replace...this...address"; 

export function buildDepositTransaction({
  sender,
  payeeAddress,
  amountEgld,
  taskIdStr,
  nonce
}: {
  sender: string;
  payeeAddress: string;
  amountEgld: string;
  taskIdStr: string;
  nonce: number;
}) {
  const contractAddress = new Address(CONTRACT_ADDRESS);
  const senderAddress = new Address(sender);
  const payeeAddr = new Address(payeeAddress);
  
  // Transformam ID-ul de task din Convex (ex: 'jd7abc123...') in format Hex
  const taskIdHex = Buffer.from(taskIdStr, 'utf8').toString('hex');
  
  // Numele functiei din Smart Contract (`#[endpoint(deposit)]`)
  const functionName = "deposit";
  
  // Construim argumentele pentru functia `deposit(payee: ManagedAddress, task_id: ManagedBuffer)`
  // SDK-ul asteapta argumentele sub forma de string-uri hexazecimale adaugate la payload
  const args = [
    payeeAddr.hex(),
    taskIdHex
  ];

  const payloadString = `${functionName}@${args.join('@')}`;
  const data = new TransactionPayload(payloadString);
  
  // Cream transferul in EGLD
  const value = TokenTransfer.egldFromAmount(amountEgld);

  // Construim tranzactia oficiala
  const tx = new Transaction({
    nonce: nonce,
    sender: senderAddress,
    receiver: contractAddress,
    value: value,
    gasLimit: 10000000, // Limita de gas pentru smart contract call
    data: data,
    chainID: "D" // 'D' pentru devnet, '1' pentru mainnet
  });

  return tx;
}
