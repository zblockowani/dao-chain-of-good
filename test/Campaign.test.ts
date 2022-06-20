import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import {
  Campaign, ILendingPool,
  MockDaiToken
} from "../typechain-types";
import { moveBlocks } from "../utils/move-blocks";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Campaign", () => {
      const startBlock = 20;
      const endBlock = 100;
      const metadataUrl = "ipfs://CID";
      let campaign: Campaign;
      let deployer: SignerWithAddress;
      let charity: SignerWithAddress;
      let firstDonor: SignerWithAddress;
      let secondDonor: SignerWithAddress;
      let token: MockDaiToken;
      let lendingPool: ILendingPool;

      beforeEach(async () => {
        [deployer, charity, firstDonor, secondDonor] =
          await ethers.getSigners();
        await deployments.fixture(["mock", "setupMocks"]);

        token = await ethers.getContract("MockDaiToken");
        lendingPool = await ethers.getContract("MockLendingPool");

        const args = [
          startBlock,
          endBlock,
          token.address,
          lendingPool.address,
          charity.address,
          metadataUrl,
        ];

        await deployments.deploy("Campaign", {
          from: deployer.address,
          args: args,
        });

        campaign = await ethers.getContract("Campaign");
      });

      describe("Constructor", () => {
        it("Should deploy with correct arguments", async () => {
          const info = await campaign.getInfo();

          expect(info.startBlock).to.be.equal(startBlock);
          expect(info.endBlock).to.be.equal(endBlock);
          expect(info.beneficiaryWallet).to.be.equal(charity.address);
          expect(info.metadataUrl).to.be.equal(metadataUrl);
        });

        it("Should lendingPool has allowance", async () => {
          expect(
            await token.allowance(campaign.address, lendingPool.address)
          ).to.be.equal(ethers.constants.MaxUint256);
        });
      });

      describe("Donation", () => {
        it("Should revert when current block is before startBlock", async () => {
          await expect(
            campaign.connect(firstDonor).donate(100)
          ).to.be.revertedWith("Campaign__NotInProgress");
        });

        it("Should revert when current block is after endBlock", async () => {
          const currentBlock = await ethers.provider.getBlockNumber();
          const remainBlocks = endBlock - currentBlock;
          await moveBlocks(remainBlocks);
          await expect(
            campaign.connect(firstDonor).donate(100)
          ).to.be.revertedWith("Campaign__NotInProgress");
        });

        it("Should revert user didn't approve tokens before donate", async () => {
          const currentBlock = await ethers.provider.getBlockNumber();
          const remainBlocks = startBlock - currentBlock;
          await moveBlocks(remainBlocks);

          await expect(
            campaign.connect(firstDonor).donate(100)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Should donate be successful", async () => {
          const currentBlock = await ethers.provider.getBlockNumber();
          const remainBlocks = startBlock - currentBlock;
          const donationAmount = 1000;
          await token
            .connect(firstDonor)
            .approve(campaign.address, donationAmount);
          await moveBlocks(remainBlocks);

          await expect(campaign.connect(firstDonor).donate(donationAmount))
            .to.emit(campaign, "Donated")
            .withArgs(firstDonor.address, donationAmount);

          const info = await campaign.getInfo();
          const donorDonation = await campaign.getDonorDonation(
            firstDonor.address
          );

          expect(info.donationPool).to.be.equal(donationAmount);
          expect(donorDonation).to.be.equal(donationAmount);
        });
      });
      
      describe("Withdraw", () => {
        it("Should revert when requeste more than it was donated", async () => {
            await expect(campaign.connect(firstDonor).withdraw(100)).to.be
            .revertedWith("Campaing__WrongWithdrawRequested");
        });

        it("Should withdraw be possible during the campaing", async () => {
          const donation = 1000;
          const withdraw = 500;
          const currentBlock = await ethers.provider.getBlockNumber();
          const remainBlocks = startBlock - currentBlock;
          await token.connect(firstDonor).approve(campaign.address, donation);
          const donorBalanceBeforeWithdraw = await token.balanceOf(
            firstDonor.address
          );
          await moveBlocks(remainBlocks);
          await campaign.connect(firstDonor).donate(donation);

          await expect(campaign.connect(firstDonor).withdraw(withdraw))
            .to.emit(campaign, "Withdrawn")
            .withArgs(firstDonor.address, withdraw);

          const info = await campaign.getInfo();

          expect(info.donationPool).to.be.equal(donation - withdraw);
          expect(await token.balanceOf(firstDonor.address)).to.be.equal(
            donorBalanceBeforeWithdraw.sub(withdraw)
          );
        });

        it("Should withdraw be possible after the campaing is ended", async () => {
          const donation = 1000;
          const withdraw = 500;
          let currentBlock = await ethers.provider.getBlockNumber();
          const blocksToStart = startBlock - currentBlock;
          await token.connect(firstDonor).approve(campaign.address, donation);
          const donorBalanceBeforeWithdraw = await token.balanceOf(
            firstDonor.address
          );
          await moveBlocks(blocksToStart);
          await campaign.connect(firstDonor).donate(donation);

          currentBlock = await ethers.provider.getBlockNumber();
          const blocksToEnd = endBlock - currentBlock;
          await moveBlocks(blocksToEnd);

          await campaign.endCampaign();

          await expect(campaign.connect(firstDonor).withdraw(withdraw))
            .to.emit(campaign, "Withdrawn")
            .withArgs(firstDonor.address, withdraw);

          const info = await campaign.getInfo();

          expect(info.donationPool).to.be.equal(donation - withdraw);
          expect(await token.balanceOf(firstDonor.address)).to.be.equal(
            donorBalanceBeforeWithdraw.sub(withdraw)
          );
        });
      });
    });
