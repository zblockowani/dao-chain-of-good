import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { ADDRESS_ZERO, DEVELOPMENT_CHAINS } from "../helper-hardhat-config";
const setupAave: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getUnnamedAccounts, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const [userOne, userTwo] = await getUnnamedAccounts();

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    console.log("Setting up mock balances...");
    const mockDaiToken = await ethers.getContract("MockDaiToken");
    const mockLendingPool = await ethers.getContract("MockLendingPool");

    const lendingPoolTransferTx = await mockDaiToken.transfer(
      mockLendingPool.address,
      "900000000000000000000000"
    );
    await lendingPoolTransferTx.wait(1);

    const userOnePoolTransferTx = await mockDaiToken.transfer(
      userOne,
      "100000000000000000000"
    );
    await userOnePoolTransferTx.wait(1);

    const userTwoPoolTransferTx = await mockDaiToken.transfer(
      userTwo,
      "100000000000000000000"
    );
    await userTwoPoolTransferTx.wait(1);

    console.log("Mock balances are set up!");
  }
};

export default setupAave;
setupAave.tags = ["all", "mock"];
