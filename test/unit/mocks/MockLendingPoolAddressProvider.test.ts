import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../../helper-hardhat-config";
import {
  MockLendingPool,
  MockLendingPoolAddressProvider,
} from "../../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MockLendingPoolAddressProvider", () => {
      let addressProvider: MockLendingPoolAddressProvider;
      let lendingPool: MockLendingPool;
      beforeEach(async () => {
        await deployments.fixture("mock");
        addressProvider = await ethers.getContract(
          "MockLendingPoolAddressProvider"
        );
        lendingPool = await ethers.getContract("MockLendingPool");
      });

      it("Should return mocked lending pool address", async () => {
        expect(await addressProvider.getLendingPool()).to.be.equal(
          lendingPool.address
        );
      });
    });
