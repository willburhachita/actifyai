import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy ActifyToken
  const Token = await ethers.getContractFactory("ActifyToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ActifyToken deployed to:", tokenAddress);

  // 2. Deploy ActifyEscrow (token address + deployer as treasury)
  const Escrow = await ethers.getContractFactory("ActifyEscrow");
  const escrow = await Escrow.deploy(tokenAddress, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("ActifyEscrow deployed to:", escrowAddress);

  console.log("\n=== Add these to your .env.local ===");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=11155111`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
