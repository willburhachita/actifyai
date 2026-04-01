// Contract ABIs (human-readable format for ethers.js)
export const TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function claimFaucet() external",
  "function hasClaimed(address) view returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;

export const ESCROW_ABI = [
  "function lockTokens(bytes32 orderId, uint256 amount) external",
  "function releaseTokens(bytes32 orderId) external",
  "function refundTokens(bytes32 orderId) external",
  "function getEscrow(bytes32 orderId) view returns (tuple(address buyer, uint256 amount, uint8 status, uint256 createdAt))",
] as const;

// Sepolia chain config
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Sepolia Testnet",
  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// Contract addresses (set after deployment via .env.local)
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "";

// Convert a Convex order ID string to bytes32 for the smart contract
export function orderIdToBytes32(orderId: string): string {
  // Use a simple hash — ethers.id computes keccak256 of the UTF-8 string
  const { id } = require("ethers") as typeof import("ethers");
  return id(orderId);
}

// Format token amount (18 decimals)
export function toTokenUnits(amount: number): bigint {
  const { parseEther } = require("ethers") as typeof import("ethers");
  return parseEther(amount.toString());
}

// Parse token amount from wei
export function fromTokenUnits(amount: bigint): number {
  const { formatEther } = require("ethers") as typeof import("ethers");
  return parseFloat(formatEther(amount));
}
