import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../../helper-hardhat-config";
import {
  MockADaiToken,
  MockDaiToken,
  MockLendingPool,
} from "../../../typechain-types";
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MockLendingPool", () => {
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

      describe("Deposit", () => {
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

      describe("Withrdaw", () => {
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
