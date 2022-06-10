import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../../helper-hardhat-config";
import {
  MockADaiToken
} from "../../../typechain-types";
import { moveBlocks } from "../../../utils/move-blocks";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MockADaiToken", () => {
      let aDaiToken: MockADaiToken;
      let deployer: string;

      beforeEach(async () => {
        await deployments.fixture("mock");
        aDaiToken = await ethers.getContract("MockADaiToken");
        deployer = (await getNamedAccounts()).deployer;
      });

      it("Should mint tokens", async () => {
        const tokensAmount = 100000;
        await aDaiToken.mint(deployer, tokensAmount);
        const currentBlock = await ethers.provider.getBlockNumber();

        expect(await aDaiToken.balanceOf(deployer)).to.be.equal(tokensAmount);
        expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(
          currentBlock
        );
      });

      it("Should generate profit", async () => {
        const tokensAmount = 10000;
        await aDaiToken.mint(deployer, tokensAmount);
        const tokensAmountAfterOneBlock = tokensAmount + 10; //0.01% per blok
        const currentBlock = await ethers.provider.getBlockNumber();

        await moveBlocks(1);

        expect(await aDaiToken.balanceOf(deployer)).to.be.equal(
          tokensAmountAfterOneBlock
        );
        expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(
          currentBlock
        );
      });

      it("Should burn tokens", async () => {
        const tokensAmount = 10000;
        await aDaiToken.mint(deployer, tokensAmount);
        const tokensAmountAfterOneBlock = tokensAmount + 10; //0.01% per blok
        await aDaiToken.burn(deployer, tokensAmountAfterOneBlock);
        const currentBlock = await ethers.provider.getBlockNumber();

        expect(await aDaiToken.balanceOf(deployer)).to.be.equal(0);
        expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(
          currentBlock
        );
      });
    });
