import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DEVELOPMENT_CHAINS } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

const deployMockDai: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, network, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Deploying mock contracts...");
    const daiToken = await deploy("MockDaiToken", {
      from: deployer,
      args: [],
      log: true,
    });

    const aDaiToken = await deploy("MockADaiToken", {
      from: deployer,
      args: [],
      log: true,
    });

    const lendingPool = await deploy("MockLendingPool", {
      from: deployer,
      args: [aDaiToken.address, daiToken.address],
      log: true,
    });

    await deploy("MockLendingPoolAddressProvider", {
      from: deployer,
      args: [lendingPool.address],
      log: true,
    });

    log("Mocks has been deployed!");
  }
};

export default deployMockDai;
deployMockDai.tags = ["all", "mock"];
