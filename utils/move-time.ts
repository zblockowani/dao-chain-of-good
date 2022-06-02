import { network } from "hardhat";

export const moveTime = async (amount: number) => {
  console.log("Moving time...");
  await network.provider.send("evm_increaseTime", [amount]);
  console.log(`Time has been shifted by ${amount}`);
};