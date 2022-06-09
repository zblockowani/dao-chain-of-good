import { expect } from "chai";
import { deployContract, MockProvider } from "ethereum-waffle";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { MockADaiToken, MockADaiToken__factory } from "../../../typechain-types";
import { moveBlocks } from "../../../utils/move-blocks";

describe("MockADaiToken", async () => {
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
    expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(currentBlock);
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
    expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(currentBlock);
  });

  it("Should burn tokens", async () => {
    const tokensAmount = 10000;
    await aDaiToken.mint(deployer, tokensAmount);
    const tokensAmountAfterOneBlock = tokensAmount + 10; //0.01% per blok
    await aDaiToken.burn(deployer, tokensAmountAfterOneBlock);
    const currentBlock = await ethers.provider.getBlockNumber();

    expect(await aDaiToken.balanceOf(deployer)).to.be.equal(0);
    expect(await aDaiToken.s_transferBlock(deployer)).to.be.equal(currentBlock);
  });

  it("Should revert", async() => {
    let [admin, normalUser] = new MockProvider().getWallets();

    const dai = await deployContract(admin, MockADaiToken__factory);
    await expect(aDaiToken.a()).to.be.revertedWith("Test");
  }) 
});
