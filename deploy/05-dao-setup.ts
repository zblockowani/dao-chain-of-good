import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
const setup: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const governor = await ethers.getContract("ChainOfGoodGovernor");
  const timeLock = await ethers.getContract("ChainOfGoodTimeLock");
  const factory = await ethers.getContract("ChainOfGoodFactory");

  console.log("Transfering ownership of Factory.");

  const ownershipTx = await factory.transferOwnership(timeLock.address);
  ownershipTx.wait(1);

  console.log("Ownership transferd to TimeLock contract!");

  console.log("Setting up DAO roles.");

  const adminRole = timeLock.TIMELOCK_ADMIN_ROLE();
  const proposerRole = timeLock.PROPOSER_ROLE();
  const executorRole = timeLock.EXECUTOR_ROLE();

  const grantProposerRoleTx = await timeLock.grantRole(
    proposerRole,
    governor.address
  );
  await grantProposerRoleTx.wait(1);

  const grantExecutorRoleTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await grantExecutorRoleTx.wait(1);

  const revokeAdminRoleTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeAdminRoleTx.wait(1);

  console.log("DAO roles have been set!");
};

export default setup;
setup.tags = ["all", "setup"];
