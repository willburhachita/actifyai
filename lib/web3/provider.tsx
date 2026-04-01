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
};

type WalletActions = {
  connectWallet: () => Promise<void>;
  claimFaucet: () => Promise<void>;
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
  const connectWalletMutation = useMutation(api.wallets.connectWallet);
  const markClaimedMutation = useMutation(api.wallets.markFaucetClaimed);
  const updateBalanceMutation = useMutation(api.wallets.updateBalance);

  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const claimFaucet = useCallback(async () => {
    if (!address || !TOKEN_ADDRESS) return;
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      const { BrowserProvider, Contract } = await import("ethers");
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      const tx = await token.claimFaucet();
      await tx.wait();

      await markClaimedMutation({ auth0Id });
    } catch (err: any) {
      setError(err.message ?? "Faucet claim failed");
    }
  }, [address, auth0Id, markClaimedMutation]);

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
      if (!address || !TOKEN_ADDRESS || !ESCROW_ADDRESS) return null;
      const ethereum = getEthereum();
      if (!ethereum) return null;

      try {
        const { BrowserProvider, Contract } = await import("ethers");
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
        const escrow = new Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

        const amount = toTokenUnits(args.tokenAmount);
        // Use orderId if present, otherwise use the eBay item ID as the order key
        const orderKey = args.orderId ?? args.ebayItemId ?? `ebay_${Date.now()}`;
        const orderBytes = orderIdToBytes32(orderKey);

        // Step 1: Approve escrow to spend tokens
        const approveTx = await token.approve(ESCROW_ADDRESS, amount);
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
      connectWallet,
      claimFaucet,
      purchaseProduct,
      confirmDelivery,
      requestRefund,
      switchToSepolia,
    }),
    [
      isConnected, isConnecting, address, tokenBalance, hasClaimed,
      chainId, isCorrectChain, error,
      connectWallet, claimFaucet, purchaseProduct, confirmDelivery,
      requestRefund, switchToSepolia,
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
