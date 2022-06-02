import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DEVELOPMENT_CHAINS,
  networkConfig,
  QUORUM_PERCENTAGE,
  VOTING_DELAY,
  VOTING_PERIOD,
  VOTING_THRESHOLD,
} from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployGovernor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Governor deployment...");

  const token = await get("ChainOfGoodToken");
  const timeLock = await get("ChainOfGoodTimeLock");

  const args = [
    token.address,
    timeLock.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    VOTING_THRESHOLD,
    QUORUM_PERCENTAGE,
  ];
  const governor = await deploy("ChainOfGoodGovernor", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmation || 0,
  });

  log(`Governor is deployed at address ${governor.address}!`);

  if (
    !DEVELOPMENT_CHAINS.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governor.address, args);
  }
};

export default deployGovernor;
deployGovernor.tags = ["all", "governor"];
