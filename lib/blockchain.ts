import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { generateKeyPairSync } from 'crypto';
import { promises } from "dns";

export class Transaction {
  amount: number;
  sender: string;
  recipient: string;
  tx_id: string;
  timestamp: number;
  signature: string;

  constructor(amount: number, sender: string, recipient: string, privateKey: string) {
      this.amount = amount;
      this.sender = sender;
      this.recipient = recipient;
      this.tx_id = uuidv4().split('-').join();
      this.timestamp = Date.now();
      this.signature = "";
  }

  // // This will sign the transaction using privateKey
  // signTransaction(privateKey: string) {
  //     const sign = crypto.createSign('SHA256');
  //     sign.update(this.tx_id + this.amount + this.sender + this.recipient);
  //     sign.end();
  //     return sign.sign(privateKey, 'hex');
  // }

  // // This will check the signature of the transaction using publicKey
  // isValidTransaction(publicKey: string) {
  //     const verify = crypto.createVerify('SHA256');
  //     verify.update(this.tx_id + this.amount + this.sender + this.recipient);
  //     verify.end();
  //     return verify.verify(publicKey, this.signature, 'hex');
  // }
}

export class Wallet {
  id: string;
  name: string;
  balance: number;
  publicKey: string;
  privateKey: string;

  constructor(id: string, name: string, balance: number, publicKey: string, privateKey: string) {
    this.id = id;
    this.name = name;
    this.balance = balance;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }


}

// export class Block {
//   hash: string;
//   nonce: number;
//   timestamp: number;

//   constructor(
//     public index: number,
//     public transactions: Transaction[],
//     public previousHash: string,
//     nonce: number,
//     hash: string
//   ) {
//     this.nonce = nonce;
//     this.timestamp = Math.floor(Date.now() / 1000);
//     this.hash = hash;
//   }
// }

export class Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  prevHash: string;
  hash: string;
  merkleRoot: string;
  nonce: number;

  constructor(index: number, transactions: Transaction[], prevHash: string, nonce: number, hash: string) {
      this.index = index;
      this.timestamp = Math.floor(Date.now() / 1000);
      this.transactions = transactions;
      this.prevHash = prevHash;
      this.hash = hash;
      this.merkleRoot = constructMerkleTree(transactions);
      this.nonce = nonce;
  }
}

export class Blockchain {
  chain: Block[];
  pendingTransactions: Transaction[];
  difficulty: number;
  wallets: Wallet[];

  constructor() {
      this.chain = [];
      this.pendingTransactions = [];
      this.addBlock(0);
      this.difficulty = 3;
      this.wallets = [];
  }

  /**
   * Creates a transaction on the blockchain
   */
  createTransaction(amount: number, sender: string, recipient: string, privateKey: string) {
      let transaction = new Transaction(amount, sender, recipient, privateKey);
      this.pendingTransactions.push(new Transaction(amount, sender, recipient, privateKey));
      return transaction;
  }

  /**
   * Adds a new block to the blockchain after successful mining.
   * 
   * This function creates a block, calculates its hash, and appends it to the blockchain.
   * After appending, it resets pending transactions and adjusts the mining difficulty periodically.
   * 
   * @param {number} nonce - The nonce value obtained from the proofOfWork().
   */
  addBlock(nonce: number) {
      const index = this.chain.length;
      const merkleRoot = constructMerkleTree(this.pendingTransactions)
      const prevHash = this.chain[this.chain.length - 1]?.hash || "0";
      const hash = this.getHash(prevHash, merkleRoot, nonce);

      const newBlock = new Block(index, this.pendingTransactions, prevHash, nonce, hash);
      this.chain.push(newBlock);
      this.pendingTransactions = [];
  }

  /**
   * Gets the hash of a block.
   */
  getHash(prevHash: string, merkleRoot: string, nonce: number) {
      var encrypt = prevHash + nonce + merkleRoot; // Using merkleRoot and removed array of transactions.
      var hash = crypto.createHmac('sha256', "secret")
          .update(encrypt)
          .digest('hex');
      return hash;
  }

  /**
  * Find nonce that satisfies our proof of work.
  * 
  * This function repeatedly tries different nonce values until it finds one that,
  * when combined with the previous block's hash and pending transactions, produces
  * a valid hash under the difficulty target.
  * 
  * @returns {Number} - value containing the valid nonce value.
  */
  proofOfWork(): number {
      let nonce = 0;
      const prevHash = this.chain[this.chain.length - 1]?.hash || "0";
      const merkleRoot = constructMerkleTree(this.pendingTransactions);

      // This while loop will run untill it finds a hash that is equal or less than the target hash.
      while (true) {
          const hash = this.getHash(prevHash, merkleRoot, nonce);
          if (hash.startsWith('0'.repeat(this.difficulty))) {
              console.log(`Block mined! Nonce: ${nonce}, Hash: ${hash}`);
              return nonce;
          }
          nonce++;
      }
  }

  /**
   * Dynamically generates a difficulty target for mining validation.
   * 
   * This function determines the maximum allowable hash value based on the current difficulty level.
   * 
   * @returns {string} The generated difficulty target as a hexadecimal string.
   */
  computeDifficultyTarget(): string {
      return '0'.repeat(this.difficulty) + 'F'.repeat(64 - this.difficulty); // Initially it will start with 3 '0's and the rest Hex will be 'FFF...'
  }

  /**
   * Mine a block and add it to the chain.
   */
  mine() {
      let nonce = this.proofOfWork();
      const newBlock = this.addBlock(nonce);
  }

  async createWallet(name: string, balance: number) {
    const { publicKey, privateKey } = await generateWalletKeyPair();

    if (publicKey && privateKey) {
      const newWallet = new Wallet(uuidv4(), name, balance, publicKey, privateKey);
      this.wallets.push(newWallet);
    }
  }

}

/**
 * Computes the SHA256 hash of the given data.
 * 
 * @param {string | object} data - The input data to be hashed.
 * @returns {string} - The resulting SHA256 hash in hexadecimal format.
 */
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
* Constructs the Merkle tree from an array of transactions.
* 
* This function takes a list of transactions, generates their SHA256 hashes (leaves), 
* and recursively combines them into a Merkle tree. The tree is built by repeatedly 
* hashing pairs of transaction hashes until only a single root hash remains, which represents 
* the Merkle root for the block containing those transactions.
* 
* @param {Array} transactions - An array of transaction objects to be included in the Merkle tree.
* @returns {string} - The Merkle root hash of the block.
*/
export function constructMerkleTree(transactions: Array<any>): string {
  if (transactions.length === 0) return '0';

  let merkleLeaves = transactions.map(tx => sha256(JSON.stringify(tx)));

  function buildTree(leaves: Array<string>): string {
      if (leaves.length === 1) return leaves[0]; // This will return the hash of transaction if there is only one transaction left in the array.

      let nextLevel = [];
      for (let i = 0; i < leaves.length; i += 2) {
          const leftLeaf = leaves[i];
          const rightLeaf = i + 1 < leaves.length ? leaves[i + 1] : leftLeaf;
          nextLevel.push(sha256(leftLeaf + rightLeaf));
      }
      return buildTree(nextLevel); // recursively calling itself
  }

  return buildTree(merkleLeaves);
}

export async function generateWalletKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: Buffer.from(publicKey).toString('base64'),
    privateKey: Buffer.from(privateKey).toString('base64'),
  };
}
