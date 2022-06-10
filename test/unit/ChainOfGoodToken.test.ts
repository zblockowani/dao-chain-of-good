import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { ChainOfGoodToken } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("ChainOfGoodToken", () => {
      let token: ChainOfGoodToken;
      let deployer: string;
      beforeEach(async () => {
        await deployments.fixture("token");
        token = await ethers.getContract("ChainOfGoodToken");
        deployer = (await getNamedAccounts()).deployer;
      });

      it("All tokens should be transfer to the deployer", async () => {
        const maxSupply = await token.s_maxSupply();
        const deployerBalance = await token.balanceOf(deployer);

        expect(deployerBalance).to.be.equal(maxSupply);
      });
    });
