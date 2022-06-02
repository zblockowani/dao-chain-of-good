import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { DEVELOPMENT_CHAINS, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Token deployment...");

  const token = await deploy("ChainOfGoodToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmation || 0,
  });

  console.log(`Tokenis deployed at address ${token.address}!`);

  if (
    !DEVELOPMENT_CHAINS.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(token.address, []);
  }

  await delegate(token.address, deployer);
};

const delegate = async (tokenAddress: string, delegated: string) => {
  const token = await ethers.getContractAt("ChainOfGoodToken", tokenAddress);

  console.log(
    `Checkpoints before delegation ${await token.numCheckpoints(delegated)}`
  );

  console.log("Token delegation...");

  const tx = await token.delegate(delegated);
  await tx.wait(1);

  console.log("Delegation is done!");

  console.log(
    `Checkpoints after delegation ${await token.numCheckpoints(delegated)}`
  );
};

export default deployToken;
deployToken.tags = ["all", "token"];
