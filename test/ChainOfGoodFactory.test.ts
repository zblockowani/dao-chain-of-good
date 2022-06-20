import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  deployments,
  ethers, network
} from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { ChainOfGoodFactory, MockDaiToken } from "../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("ChainOfGoodFactory", () => {
      const startBlock = 100;
      const endBlock = 200;
      const metadata = "ipfs://CID";
      let normalUser: SignerWithAddress;
      let charity: SignerWithAddress;
      let factory: ChainOfGoodFactory;
      let token: MockDaiToken;

      before(async () => {
        await deployments.fixture(["mock", "factory"]);
        [, normalUser, charity] = await ethers.getSigners();
        factory = await ethers.getContract("ChainOfGoodFactory");
        token = await ethers.getContract("MockDaiToken");
      });

      it("Should create campaign", async () => {
        const tx = await factory.createCampaign(
          100,
          200,
          token.address,
          charity.address,
          metadata
        );
        const response = await tx.wait(1);
        const eventArgs = response.events![1].args; // second event because the first one is Approval from Campaign constructor

        const campaignAddress = eventArgs!.campaignAddress;
        const campaigns = await factory.getCampaigns();

        expect(campaigns).to.have.length(1);
        expect(campaigns[0]).to.be.equal(campaignAddress);
        expect(eventArgs!.startBlock).to.be.equal(startBlock);
        expect(eventArgs!.endBlock).to.be.equal(endBlock);
        expect(eventArgs!.tokenAddress).to.be.equal(token.address);
        expect(eventArgs!.beneficiaryWallet).to.be.equal(charity.address);
      });

      it("Should revert when not an owner", async () => {
        await expect(
          factory
            .connect(normalUser)
            .createCampaign(100, 200, token.address, charity.address, metadata)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
