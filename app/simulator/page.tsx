"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogConsole } from "@/components/log-console";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bitcoin,
  Blocks,
  Wallet,
  ArrowLeftRight,
  Plus,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Block,
  Blockchain,
  Transaction,
  Wallet as WalletType,
  constructMerkleTree,
  generateWalletKeyPair,
} from "@/lib/blockchain";
import Image from "next/image";

export default function BlockchainSimulator() {
  const [AppBlockchain] = useState(() => new Blockchain());
  // const AppBlockchain = new Blockchain();

  const [logs, setLogs] = useState<{ message: string; timestamp: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isNewWalletOpen, setIsNewWalletOpen] = useState(false);
  const [isMiningOpen, setIsMiningOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [nonceDisplay, setNonceDisplay] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [mined, setMined] = useState("");
  const [isPendingTransactionsEmpty, setIsPendingTransactionsEmpty] = useState(true);
  const [payload, setPayload] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    from: "",
    to: "",
    amount: 0,
  });
  const [newWallet, setNewWallet] = useState({
    name: "",
    balance: 0,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addLog("Initializing blockchain...");
    addLog("Generating key for system...");
    addLog("Key generated completed");
    addLog("Blockchain initialized with genesis block");

    // Create initial wallet
    async function createInitialWallet() {
      await AppBlockchain.createWallet("My Wallet", 10000);
      AppBlockchain.createTransaction(
        10000,
        "System",
        AppBlockchain.wallets[AppBlockchain.wallets.length - 1].id,
        AppBlockchain.wallets[AppBlockchain.wallets.length - 1].privateKey
      );
      AppBlockchain.mine();
      addLog(
        `Initial wallet "${
          AppBlockchain.wallets[AppBlockchain.wallets.length - 1].name
        }" created with balance ${
          AppBlockchain.wallets[AppBlockchain.wallets.length - 1].balance
        } BLX and mined`
      );
    }
    createInitialWallet();
  }, []);

  const myWallet = AppBlockchain.wallets.find((w) => w.name === "My Wallet");
  useEffect(() => {
    if (myWallet) {
      setNewTransaction((prev) => ({ ...prev, from: myWallet.id }));
    }
  }, [myWallet]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, { message, timestamp: new Date() }]);
  };

  const createWallet = async (name: string, balance: number) => {
    await AppBlockchain.createWallet(name, balance);

    AppBlockchain.createTransaction(
      balance,
      "System",
      AppBlockchain.wallets[AppBlockchain.wallets.length - 1].id,
      AppBlockchain.wallets[AppBlockchain.wallets.length - 1].privateKey
    );
    AppBlockchain.mine();
    setIsNewWalletOpen(false);
    addLog(`Created wallet: ${name} with initial balance ${balance} BLX`);
  };

  const createTransaction = () => {
    const fromWallet = AppBlockchain.wallets.find(
      (w) => w.id === newTransaction.from
    );
    const toWallet = AppBlockchain.wallets.find(
      (w) => w.id === newTransaction.to
    );

    if (!fromWallet || !toWallet) {
      addLog("Invalid wallet selection");
      return;
    }

    if (fromWallet.balance < newTransaction.amount) {
      addLog("Insufficient balance");
      return;
    }

    AppBlockchain.createTransaction(
      newTransaction.amount,
      fromWallet.id,
      toWallet.id,
      fromWallet.privateKey
    );

    // Sign the transaction
    // Future implementation

    setIsNewTransactionOpen(false);
    addLog(
      `New transaction: ${newTransaction.amount} from ${fromWallet.name} to ${toWallet.name}`
    );
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMining) {
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isMining]);

  const mineABlock = () => {
    if (AppBlockchain.pendingTransactions.length === 0) {
      setIsPendingTransactionsEmpty(true);
      return;
    }
    setIsMining(true);
    setTimeElapsed(0);
    setMined("");
    const previousHash =
      AppBlockchain.chain[AppBlockchain.chain.length - 1]?.hash || "0";
    const merkleRoot = constructMerkleTree(AppBlockchain.pendingTransactions);
    const transactions = AppBlockchain.pendingTransactions;
    setPayload(JSON.stringify(transactions));

    const mineBlock = async (
      currentNonce: number,
      previousHash: string,
      merkleRoot: string
    ) => {

      const newHash = await AppBlockchain.getHash(
        previousHash,
        merkleRoot,
        currentNonce
      );

      setNonce(currentNonce);
      setHash(newHash);

      if (newHash.startsWith("0".repeat(AppBlockchain.difficulty))) {
        setIsMining(false);
        setMined("Successfully mined a new block!!");
        AppBlockchain.mine();
        return;
      }
      setTimeout(
        () => mineBlock(currentNonce + 1, previousHash, merkleRoot),
        0
      );
    };
    mineBlock(1, previousHash, merkleRoot);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Bitcoin className="h-8 w-8 text-primary" />
              <span className="ml-2 text-md md:text-xl font-bold">
                BlockchainX
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="blocks" className="space-y-4">
          <div className="flex items-center justify-between md:flex-row flex-col">
            <TabsList>
              <TabsTrigger value="blocks">
                <Blocks className="h-4 w-4 mr-2" />
                Blocks ({AppBlockchain.chain.length})
              </TabsTrigger>
              <TabsTrigger value="wallets">
                <Wallet className="h-4 w-4 mr-2" />
                Wallets ({AppBlockchain.wallets.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Pending ({AppBlockchain.pendingTransactions.length})
              </TabsTrigger>
            </TabsList>
            <div className="block items-center space-x-0 md:space-x-2 md:flex md:py-0 py-2">

              {/* New Wallet Button */}
              <Dialog open={isNewWalletOpen} onOpenChange={setIsNewWalletOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="float-left">
                    <Plus className="h-4 w-4 mr-2" />
                    New Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Wallet</DialogTitle>
                    <DialogDescription>
                      Add a new wallet to the blockchain.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label>Name</label>
                      <Input
                        value={newWallet.name}
                        onChange={(e) =>
                          setNewWallet({ ...newWallet, name: e.target.value })
                        }
                      ></Input>
                    </div>
                    <div className="space-y-2">
                      <label>Initial Balance</label>
                      <Input
                        value={newWallet.balance}
                        onChange={(e) =>
                          setNewWallet({
                            ...newWallet,
                            balance: Number(e.target.value),
                          })
                        }
                      ></Input>
                    </div>
                    <Button
                      onClick={() =>
                        createWallet(newWallet.name, newWallet.balance)
                      }
                      className="w-full"
                    >
                      Create Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* New Transaction Button */}
              <Dialog
                open={isNewTransactionOpen}
                onOpenChange={setIsNewTransactionOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="float-right">
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Transaction</DialogTitle>
                    <DialogDescription>
                      Add new transactions, this transaction will be added to
                      the pending transaction
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label>From Wallet</label>
                      <Select
                        value={
                          AppBlockchain.wallets.find(
                            (w) => w.name === "My Wallet"
                          )?.id
                        }
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, from: value })
                        }
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sender" />
                        </SelectTrigger>
                        <SelectContent>
                          {AppBlockchain.wallets
                            .filter((wallet) => wallet.name === "My Wallet")
                            .map((wallet) => (
                              <SelectItem key={wallet.id} value={wallet.id}>
                                {wallet.name} ({wallet.balance} BLX)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        * This is your wallet, you can only send funds from this
                        wallet.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label>To Wallet</label>
                      <Select
                        value={newTransaction.to}
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, to: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select receiver" />
                        </SelectTrigger>
                        <SelectContent>
                          {AppBlockchain.wallets.map((wallet) => (
                            <SelectItem
                              key={wallet.id}
                              value={wallet.id}
                              disabled={wallet.name === "My Wallet"}
                            >
                              {wallet.name} ({wallet.balance} BLX)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        * Select a different wallet to send funds to.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label>Amount</label>
                      <Input
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            amount: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Button onClick={createTransaction} className="w-full">
                      Create Transaction
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Mine Block Button */}
              <Dialog
                open={isMiningOpen}
                onOpenChange={() => {
                  setIsMiningOpen(!isMiningOpen);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      if (AppBlockchain.pendingTransactions.length > 0) {
                        setIsPendingTransactionsEmpty(false);
                        mineABlock();
                      } else {
                        setIsPendingTransactionsEmpty(true);
                        addLog("No pending transactions to mine");
                      }
                    }}
                    className="w-full md:w-auto mt-2 md:mt-0"
                  >
                    {"Mine Block"}
                  </Button>
                </DialogTrigger>
                {
                  !isPendingTransactionsEmpty ? (
                    <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        Mining Visualizer{" "}
                        <small className="text-xs text-muted-foreground">
                          {isMining ? "running..." : ""}
                        </small>
                      </DialogTitle>
                      <DialogDescription>
                        Mine a new block to add the pending transactions to the
                        blockchain.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 mx-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {mined}
                      </motion.div>
                      <div className="grid md:grid-cols-3 gap-32 mt-4">
                        <Card className="p-4" style={{ width: "250px" }}>
                          <h3 className="text-md md:text-lg font-semibold mb-4 border-b pb-2">
                            New Block Candidate
                          </h3>
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Previous Block Hash:
                              </span>
                              <div className="font-mono text-xs md:text-sm truncate text-primary">
                                {
                                  AppBlockchain.chain[
                                    AppBlockchain.chain.length - 1
                                  ]?.hash
                                }
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Hash:
                              </span>
                              <div className="font-mono text-xs md:text-sm truncate text-primary">
                                {hash}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Nonce:
                              </span>
                              <div className="font-mono text-xs md:text-sm truncate text-primary">
                                {nonce}
                              </div>
                            </div>
                          </div>
                        </Card>
  
                        <div className="col-span-2">
                          <p className="text-sm">
                            <span className="font-bold">PoW Difficulty:</span> 3 (
                            <span className="text-red-500">000RANDOMHASH</span>)
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-bold">Hash Rules:</span> SHA256(
                            previousHash + merkleRoot + nonce )
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-bold">Time Elapsed:</span>{" "}
                            {timeElapsed} sec
                          </p>
  
                          <div className="mt-3">
                            <p className="text-sm font-bold">Payload</p>
                            <textarea
                              className="w-full h-40 p-2 text-xs border rounded-lg"
                              readOnly
                              value={payload}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                  ) : (
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="my-4">No pending transactions</DialogTitle>
                        <DialogDescription>
                          There are no pending transactions to mine.
                          <br />
                          Add some transactions to the pending transactions list before mining.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  )
                }
              </Dialog>
            </div>
          </div>

          {/* Blocks Tab */}
          <TabsContent value="blocks">
            <div
              className="w-full overflow-x-auto custom-scrollbar"
              ref={scrollContainerRef}
            >
              <div className="flex space-x-16 p-4 pl-0 min-w-max">
                <AnimatePresence>
                  {AppBlockchain.chain.map((block, index) => (
                    <motion.div
                      key={block.hash}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative flex-shrink-0"
                      style={{ width: "250px" }}
                    >
                      <Dialog>
                        <DialogTrigger asChild>
                          <Card className="p-4 cursor-pointer hover:bg-muted/50">
                            <h3 className="text-md md:text-lg font-semibold mb-4 border-b pb-2">
                              Block {index}{" "}
                              {index === 0 && (
                                <span className="text-sm text-muted-foreground">
                                  (Genesis)
                                </span>
                              )}
                            </h3>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground text-sm">
                                  Hash:
                                </span>
                                <div
                                  className="font-mono text-xs md:text-sm truncate text-primary"
                                  id={`hash-${index}`}
                                >
                                  {block.hash}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-sm">
                                  Previous Hash:
                                </span>
                                <div
                                  className="font-mono text-xs md:text-sm truncate text-primary"
                                  id={`prev-${index}`}
                                >
                                  {block.prevHash}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Timestamp:
                                  </span>
                                  <div className="text-xs">
                                    {block.timestamp}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    DateTime:
                                  </span>
                                  <div className="text-xs">
                                    {new Date(
                                      block.timestamp * 1000
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Nonce:
                                  </span>
                                  <div className="text-xs md:text-sm">
                                    {block.nonce}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Transactions:
                                  </span>
                                  <div className="text-xs md:text-sm">
                                    {block.transactions.length}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Block Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">Index</h4>
                                <p className="font-mono text-xs md:text-sm break-all">
                                  {index === 0
                                    ? `${index} - Genesis Block`
                                    : index}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Timestamp
                                </h4>
                                <p className="font-mono text-xs md:text-sm break-all">
                                  {block.timestamp}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Hash</h4>
                              <p className="font-mono text-xs md:text-sm break-all">
                                {block.hash}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                Previous Hash
                              </h4>
                              <p className="font-mono text-xs md:text-sm break-all">
                                {block.prevHash}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                Merkle Root
                              </h4>
                              <p className="font-mono text-xs md:text-sm break-all">
                                {block.merkleRoot}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Timestamp
                                </h4>
                                <p className="text-xs md:text-sm">
                                  {new Date(
                                    block.timestamp * 1000
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Nonce</h4>
                                <p className="text-xs md:text-sm">
                                  {block.nonce}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">
                                Transactions
                              </h4>
                              <div className="space-y-2">
                                {block.transactions.length > 0 ? (
                                  block.transactions.map((tx) => (
                                    <Card key={tx.tx_id} className="p-3">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="font-semibold">
                                            {tx.amount} BLX
                                          </p>
                                          <p className="text-xs md:text-sm text-muted-foreground">
                                            From:{" "}
                                            {AppBlockchain.wallets.find(
                                              (w) => w.id === tx.sender
                                            )
                                              ? `[${
                                                  AppBlockchain.wallets.find(
                                                    (w) => w.id === tx.sender
                                                  )?.name
                                                }] - ${tx.sender}`
                                              : tx.sender}
                                          </p>
                                          <p className="text-xs md:text-sm text-muted-foreground">
                                            To:{" "}
                                            {AppBlockchain.wallets.find(
                                              (w) => w.id === tx.recipient
                                            )
                                              ? `[${
                                                  AppBlockchain.wallets.find(
                                                    (w) => w.id === tx.recipient
                                                  )?.name
                                                }] - ${tx.recipient}`
                                              : tx.recipient}
                                          </p>
                                        </div>
                                        <div className="text-xs md:text-smtext-muted-foreground">
                                          {new Date(
                                            tx.timestamp
                                          ).toLocaleTimeString()}
                                        </div>
                                      </div>
                                    </Card>
                                  ))
                                ) : (
                                  <p className="text-xs md:text-sm text-muted-foreground">
                                    No transactions
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {index < AppBlockchain.chain.length - 1 && (
                        <svg
                          className="absolute top-[89px] md:top-[98px] left-full w-16 h-16"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 300 300"
                        >
                          <g transform="matrix(3.384183 0 0 3.384183-357.691321-357.738472)">
                            <path
                              d="M79.4,20.6C50,20.6,56.66,79.4,20.6,79.4"
                              transform="matrix(-1.003986 0 0 1.141678 200.1993 92.9161)"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M44.92,26.92L21.66,67.22c-1.041244,1.81171-1.038969,4.040804.005971,5.850385s2.97442,2.925812,5.064029,2.929615h46.54c2.097583.003896,4.037275-1.11366,5.085963-2.930285s1.046414-4.055225-.005963-5.869715L55.08,26.92c-1.045448-1.818068-2.98278-2.938836-5.08-2.938836s-4.034552,1.120768-5.08,2.938836Z"
                              transform="matrix(-.003606 0.28395-.28395-.003606 201.227464 169.545049)"
                              fill="currentColor"
                            />
                            <path
                              d="M44.92,26.92L21.66,67.22c-1.041244,1.81171-1.038969,4.040804.005971,5.850385s2.97442,2.925812,5.064029,2.929615h46.54c2.097583.003896,4.037275-1.11366,5.085963-2.930285s1.046414-4.055225-.005963-5.869715L55.08,26.92c-1.045448-1.818068-2.98278-2.938836-5.08-2.938836s-4.034552,1.120768-5.08,2.938836Z"
                              transform="matrix(0-.283973 0.283973 0 98.900864 130.636376)"
                              fill="currentColor"
                            />
                          </g>
                        </svg>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AppBlockchain.wallets.map((wallet) => (
                <Card key={wallet.privateKey} className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{wallet.name}</h3>
                  <div className="space-y-2">
                    <div className="text-2xl font-mono">
                      {wallet.balance} BLX
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Public Key:
                      </p>
                      <p className="text-xs font-mono break-all">
                        {wallet.publicKey}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Private Key:
                      </p>
                      <p className="text-xs font-mono break-all blur-sm hover:blur-none cursor-pointer">
                        {wallet.privateKey}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Transactions Tab */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {AppBlockchain.pendingTransactions.map((tx) => (
                <Card key={tx.tx_id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{tx.amount} BLX</div>
                      <div className="text-sm text-muted-foreground">
                        From:{" "}
                        {AppBlockchain.wallets.find((w) => w.id === tx.sender)
                          ? `[${
                              AppBlockchain.wallets.find(
                                (w) => w.id === tx.sender
                              )?.name
                            }] - ${tx.sender}`
                          : tx.sender}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        To:{" "}
                        {AppBlockchain.wallets.find(
                          (w) => w.id === tx.recipient
                        )
                          ? `[${
                              AppBlockchain.wallets.find(
                                (w) => w.id === tx.recipient
                              )?.name
                            }] - ${tx.recipient}`
                          : tx.recipient}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Log Console */}
        <LogConsole logs={logs} />
      </main>
    </div>
  );
}
