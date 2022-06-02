import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  developmentChains,
  DEVELOPMENT_CHAINS,
  networkConfig,
} from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployFactory: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Factory deployment...");
  const chinId: number = +(await getChainId());
  let lendingPoolAddressProviderAddress: string;

  if (developmentChains.includes(network.name)) {
    const lendingPoolAddressProvider = await get(
      "MockLendingPoolAddressProvider"
    );
    lendingPoolAddressProviderAddress = lendingPoolAddressProvider.address;
  } else {
    lendingPoolAddressProviderAddress =
      networkConfig[network.name].lendingPoolAddressProviderAddress!;
  }

  const args = [lendingPoolAddressProviderAddress];
  const factory = await deploy("ChainOfGoodFactory", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmation || 0,
  });

  log(`Factory is deployed at address ${factory.address}!`);

  if (
    !DEVELOPMENT_CHAINS.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(factory.address, args);
  }
};

export default deployFactory;
deployFactory.tags = ["all", "factory"];
