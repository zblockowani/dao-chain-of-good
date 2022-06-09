import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import {
  MockADaiToken,
  MockDaiToken,
  MockLendingPool
} from "../../../typechain-types";
describe("MockLendingPool", async () => {
  let deployer: string;
  let lendingPool: MockLendingPool;
  let aDaiToken: MockADaiToken;
  let daiToken: MockDaiToken;

  beforeEach(async () => {
    await deployments.fixture(["mock", "setupMocks"]);
    deployer = (await getNamedAccounts()).deployer;
    lendingPool = await ethers.getContract("MockLendingPool");
    aDaiToken = await ethers.getContract("MockADaiToken");
    daiToken = await ethers.getContract("MockDaiToken");
  });

  describe("Deposit", async () => {
    it("Should deposit", async () => {
      const deposit = 100000;
      const lendingPoolDaiTokens = await daiToken.balanceOf(
        lendingPool.address
      );

      await daiToken.approve(lendingPool.address, deposit);
      await lendingPool.deposit(daiToken.address, deposit, deployer, 0);

      expect(await aDaiToken.balanceOf(deployer)).to.be.equal(deposit);
      expect(await daiToken.balanceOf(lendingPool.address)).to.be.equal(
        lendingPoolDaiTokens.add(deposit)
      );
    });
  });

  describe("Withrdaw", async () => {
    const deposit = 10000;

    beforeEach(async () => {
      await daiToken.approve(lendingPool.address, deposit);
      await lendingPool.deposit(daiToken.address, deposit, deployer, 0);
    });

    it("Should withdraw", async () => {
      const toWithdraw = 100;
      const deployerCurrentBalance = await daiToken.balanceOf(deployer);

      await lendingPool.withdraw(daiToken.address, toWithdraw, deployer);

      expect(await daiToken.balanceOf(deployer)).to.be.equal(
        deployerCurrentBalance.add(toWithdraw)
      );
    });

    it("Shoould withdraw all founds", async () => {
      const toWithdraw = deposit + 10000; // more than it is aDaiToken for that user
      const deployerCurrentBalance = await daiToken.balanceOf(deployer);
      const profitAfterOneBlock = 10;

      await lendingPool.withdraw(daiToken.address, toWithdraw, deployer);

      expect(await daiToken.balanceOf(deployer)).to.be.equal(
        deployerCurrentBalance.add(deposit + profitAfterOneBlock)
      );
    });
  });
});
