import { network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("ChainOfGoodToken", async () => {
      console.log("staging")
  });
