const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("RecordTransactionTracker");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
