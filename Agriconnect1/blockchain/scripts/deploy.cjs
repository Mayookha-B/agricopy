const hre = require("hardhat");

async function main() {
  console.log("Deploying AgriEscrow contract...");

  // 1. Get the contract factory
  const AgriEscrow = await hre.ethers.getContractFactory("AgriEscrow");

  // 2. Deploy the contract
  const escrow = await AgriEscrow.deploy();

  // 3. Wait for deployment to finish
  await escrow.waitForDeployment();

  // 4. Log the address
  const address = await escrow.getAddress();
  console.log("-----------------------------------------");
  console.log("AgriEscrow deployed to:", address);
  console.log("-----------------------------------------");
  console.log("COPY THIS ADDRESS TO YOUR CHECKOUT.JSX");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});