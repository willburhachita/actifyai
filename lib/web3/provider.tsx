"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  TOKEN_ABI,
  ESCROW_ABI,
  TOKEN_ADDRESS,
  ESCROW_ADDRESS,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN,
  orderIdToBytes32,
  toTokenUnits,
} from "./contracts";

type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  tokenBalance: number;
  hasClaimed: boolean;
  chainId: number | null;
  isCorrectChain: boolean;
  error: string | null;
  hasTokenContract: boolean;
  hasEscrowContract: boolean;
  isDeploying: boolean;
};

type WalletActions = {
  connectWallet: () => Promise<void>;
  claimFaucet: () => Promise<void>;
  deployToken: () => Promise<void>;
  deployEscrow: () => Promise<void>;
  purchaseProduct: (args: {
    orderId?: string;
    tokenAmount: number;
    // Optional metadata for eBay items
    productTitle?: string;
    shopLabel?: string;
    productImage?: string;
    ebayItemId?: string;
    ebayListingUrl?: string;
  }) => Promise<string | null>;
  confirmDelivery: (orderId: string) => Promise<string | null>;
  requestRefund: (orderId: string) => Promise<string | null>;
  switchToSepolia: () => Promise<void>;
  buyACTTokens: (ethAmount: number, actAmount: number) => Promise<void>;
};

type WalletContextValue = WalletState & WalletActions;

const WalletContext = createContext<WalletContextValue | null>(null);

function getEthereum(): any {
  if (typeof window !== "undefined") {
    return (window as any).ethereum;
  }
  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";

  const dbWallet = useQuery(
    api.wallets.getWalletByAuth0Id,
    auth0Id ? { auth0Id } : "skip"
  );
  const dbTokenAddress = useQuery(api.system.getConfig, { key: "TOKEN_ADDRESS" });
  const dbEscrowAddress = useQuery(api.system.getConfig, { key: "ESCROW_ADDRESS" });

  const setConfigMutation = useMutation(api.system.setConfig);
  const connectWalletMutation = useMutation(api.wallets.connectWallet);
  const markClaimedMutation = useMutation(api.wallets.markFaucetClaimed);
  const updateBalanceMutation = useMutation(api.wallets.updateBalance);
  const buyTokensMutation = useMutation(api.wallets.buyTokens);

  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use dynamic configuration from Convex, fallback to ENV
  const effectiveTokenAddress = typeof dbTokenAddress === "string" ? dbTokenAddress : TOKEN_ADDRESS;
  const effectiveEscrowAddress = typeof dbEscrowAddress === "string" ? dbEscrowAddress : ESCROW_ADDRESS;

  // Listen for MetaMask account/chain changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] ?? null);
    };
    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    // Check if already connected
    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0) setAddress(accounts[0]);
    });
    ethereum.request({ method: "eth_chainId" }).then((id: string) => {
      setChainId(parseInt(id, 16));
    });

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const isCorrectChain = chainId === SEPOLIA_CHAIN_ID;
  const isConnected = !!address && !!dbWallet;
  const tokenBalance = dbWallet?.tokenBalance ?? 0;
  const hasClaimed = dbWallet?.hasClaimed ?? false;
  const hasTokenContract = !!effectiveTokenAddress;
  const hasEscrowContract = !!effectiveEscrowAddress;

  const switchToSepolia = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_CHAIN],
        });
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setError("MetaMask not found. Please install MetaMask.");
      return;
    }
    if (!auth0Id) {
      setError("Please log in first.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      setAddress(walletAddress);

      // Switch to Sepolia if needed
      const currentChainId = await ethereum.request({ method: "eth_chainId" });
      if (parseInt(currentChainId, 16) !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }

      // Save to Convex (creates wallet with 100 token balance if new)
      await connectWalletMutation({
        auth0Id,
        address: walletAddress,
      });
    } catch (err: any) {
      setError(err.message ?? "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [auth0Id, connectWalletMutation, switchToSepolia]);

  const deployToken = useCallback(async () => {
    if (!address) {
      setError("Connect wallet first");
      return;
    }
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      setIsDeploying(true);
      setError(null);

      const { BrowserProvider, ContractFactory } = await import("ethers");
      const { TOKEN_BYTECODE } = await import("./contracts");
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Deploy ActifyToken
      const factory = new ContractFactory(TOKEN_ABI, TOKEN_BYTECODE, signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      
      await setConfigMutation({ key: "TOKEN_ADDRESS", value: addr });
    } catch (err: any) {
      setError(err.message || "Failed to deploy Token contract");
    } finally {
      setIsDeploying(false);
    }
  }, [address, setConfigMutation]);

  const deployEscrow = useCallback(async () => {
    if (!address) {
      setError("Connect wallet first");
      return;
    }
    if (!effectiveTokenAddress) {
      setError("Deploy Token contract first");
      return;
    }
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      setIsDeploying(true);
      setError(null);

      const { BrowserProvider, ContractFactory } = await import("ethers");
      const { ESCROW_BYTECODE } = await import("./contracts");
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Deploy ActifyEscrow (args: token address, treasury address)
      const factory = new ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);
      const contract = await factory.deploy(effectiveTokenAddress, address); // Treasury = deployer for demo
      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      
      await setConfigMutation({ key: "ESCROW_ADDRESS", value: addr });
    } catch (err: any) {
      setError(err.message || "Failed to deploy Escrow contract");
    } finally {
      setIsDeploying(false);
    }
  }, [address, effectiveTokenAddress, setConfigMutation]);

  const claimFaucet = useCallback(async () => {
    if (!address || !effectiveTokenAddress) return;
    const ethereum = getEthereum();
    if (!ethereum || !auth0Id) return;

    try {
      const { BrowserProvider, Contract } = await import("ethers");
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const token = new Contract(effectiveTokenAddress, TOKEN_ABI, signer);

      // Real on-chain faucet claim — triggers MetaMask confirmation
      const tx = await token.claimFaucet();
      await tx.wait();

      // Update database after successful on-chain tx
      await updateBalanceMutation({ auth0Id, newBalance: tokenBalance + 100 });
      await markClaimedMutation({ auth0Id });
    } catch (e: any) {
      setError(e.message || "Faucet claim failed");
    }
  }, [address, auth0Id, effectiveTokenAddress, tokenBalance, updateBalanceMutation, markClaimedMutation]);

  const buyACTTokens = useCallback(async (ethAmount: number, actAmount: number) => {
    if (!auth0Id || !address) {
      setError("Connect wallet first");
      return;
    }
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      const { BrowserProvider, parseEther } = await import("ethers");
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Real MetaMask transaction — send ETH to the treasury/contract
      // This triggers a MetaMask confirmation popup
      const tx = await signer.sendTransaction({
        to: effectiveEscrowAddress || address, // Send to escrow contract or self if not deployed
        value: parseEther(ethAmount.toString()),
      });
      await tx.wait();

      // Update Convex balance after confirmed on-chain tx
      await buyTokensMutation({ auth0Id, amountACT: actAmount, amountETH: ethAmount });
    } catch (e: any) {
      setError(e.message || "Token purchase failed");
    }
  }, [auth0Id, address, effectiveEscrowAddress, buyTokensMutation]);

  const purchaseProduct = useCallback(
    async (args: {
      orderId?: string;
      tokenAmount: number;
      productTitle?: string;
      shopLabel?: string;
      productImage?: string;
      ebayItemId?: string;
      ebayListingUrl?: string;
    }) => {
      if (!address || !effectiveTokenAddress || !effectiveEscrowAddress) return null;
      const ethereum = getEthereum();
      if (!ethereum) return null;

      try {
        const { BrowserProvider, Contract } = await import("ethers");
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const token = new Contract(effectiveTokenAddress, TOKEN_ABI, signer);
        const escrow = new Contract(effectiveEscrowAddress, ESCROW_ABI, signer);

        const amount = toTokenUnits(args.tokenAmount);
        // Use orderId if present, otherwise use the eBay item ID as the order key
        const orderKey = args.orderId ?? args.ebayItemId ?? `ebay_${Date.now()}`;
        const orderBytes = orderIdToBytes32(orderKey);

        // Step 1: Approve escrow to spend tokens
        const approveTx = await token.approve(effectiveEscrowAddress, amount);
        await approveTx.wait();

        // Step 2: Lock tokens in escrow
        const lockTx = await escrow.lockTokens(orderBytes, amount);
        const receipt = await lockTx.wait();

        return receipt.hash as string;
      } catch (err: any) {
        setError(err.message ?? "Purchase failed");
        return null;
      }
    },
    [address]
  );

  const confirmDelivery = useCallback(
    async (orderId: string) => {
      if (!address || !ESCROW_ADDRESS) return null;
      const ethereum = getEthereum();
      if (!ethereum) return null;

      try {
        const { BrowserProvider, Contract } = await import("ethers");
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const escrow = new Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

        const orderBytes = orderIdToBytes32(orderId);
        const tx = await escrow.releaseTokens(orderBytes);
        const receipt = await tx.wait();

        return receipt.hash as string;
      } catch (err: any) {
        setError(err.message ?? "Release failed");
        return null;
      }
    },
    [address]
  );

  const requestRefund = useCallback(
    async (orderId: string) => {
      if (!address || !ESCROW_ADDRESS) return null;
      const ethereum = getEthereum();
      if (!ethereum) return null;

      try {
        const { BrowserProvider, Contract } = await import("ethers");
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const escrow = new Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

        const orderBytes = orderIdToBytes32(orderId);
        const tx = await escrow.refundTokens(orderBytes);
        const receipt = await tx.wait();

        return receipt.hash as string;
      } catch (err: any) {
        setError(err.message ?? "Refund failed");
        return null;
      }
    },
    [address]
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      isConnected,
      isConnecting,
      address,
      tokenBalance,
      hasClaimed,
      chainId,
      isCorrectChain,
      error,
      hasTokenContract,
      hasEscrowContract,
      isDeploying,
      connectWallet,
      claimFaucet,
      deployToken,
      deployEscrow,
      purchaseProduct,
      confirmDelivery,
      requestRefund,
      switchToSepolia,
      buyACTTokens,
    }),
    [
      isConnected, isConnecting, address, tokenBalance, hasClaimed,
      chainId, isCorrectChain, error, hasTokenContract, hasEscrowContract, isDeploying,
      connectWallet, claimFaucet, deployToken, deployEscrow, purchaseProduct, confirmDelivery,
      requestRefund, switchToSepolia, buyACTTokens,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
