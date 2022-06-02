import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { DEVELOPMENT_CHAINS, MIN_DELAY, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployTimeLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  
  log("TimeLock deployment...");

  const args = [MIN_DELAY, [], []];
  // const timeLock = await deploy("ChainOfGoodTimeLock", {
  //   from: deployer,
  //   args: args,
  //   log: true,
  //   waitConfirmations: networkConfig[network.name].blockConfirmation || 0
  // });

  // log(`TimeLock is deployed at address ${timeLock.address}!`);

  if (
   
    !DEVELOPMENT_CHAINS.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    const timeLock = await get("ChainOfGoodTimeLock");
    await verify(timeLock.address, args);
  }
}

export default deployTimeLock;
deployTimeLock.tags = ["all", "timeLock"];