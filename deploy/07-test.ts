// import { ethers } from "hardhat";
// import { DeployFunction } from "hardhat-deploy/dist/types";
// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DEVELOPMENT_CHAINS } from "../helper-hardhat-config";
// import { moveBlocks } from "../utils/move-blocks";

// const deployMockDai: DeployFunction = async (
//   hre: HardhatRuntimeEnvironment
// ) => {
//   const { deployments, network } = hre;
//   const { log } = deployments;
//   const [deployer, user1, user2, campaign, beneficiary] = await hre.ethers.getSigners();

//   if (DEVELOPMENT_CHAINS.includes(network.name)) {
//     log("Testing mock contracts...");
//     const daiToken = await ethers.getContract("MockDaiToken");

//     const aDaiToken = await ethers.getContract("MockADaiToken");
//     const lendingPool = await ethers.getContract("MockLendingPool");

//     console.log(
//       "Dai Token balance deployer: ",
//       (await daiToken.balanceOf(deployer.address)).toString()
//     );
//     console.log(
//       "Dai Token balance lending pool: ",
//       (await daiToken.balanceOf(lendingPool.address)).toString()
//     );

//     const approveTx = await daiToken
//       .connect(campaign)
//       .approve(lendingPool.address, 100000000);
//     await approveTx.wait(1);

//     const approveTx2 = await daiToken
//       .connect(user1)
//       .approve(lendingPool.address, 100000000);
//     await approveTx2.wait(1);

//     const approveTx3 = await daiToken
//       .connect(user2)
//       .approve(lendingPool.address, 100000000);
//     await approveTx3.wait(1);
    
//     const depositRequest1 = await daiToken.connect(user1).transfer(campaign.address, 10000);
//     await depositRequest1.wait(1);
//     console.log(
//         "Block number: ",
//         (await ethers.provider.getBlockNumber()).toString()
//       );

//     const depositTx1 = await lendingPool
//       .connect(campaign)
//       .deposit(daiToken.address, 10000, deployer.address, 0);
//     await depositTx1.wait(1);

//     console.log(
//       "Dai Token balance user1: ",
//       (await daiToken.balanceOf(user1.address)).toString()
//     );
//     console.log(
//       "Dai Token balance user2: ",
//       (await daiToken.balanceOf(user2.address)).toString()
//     );
//     console.log(
//       "Dai Token balance campaign: ",
//       (await daiToken.balanceOf(campaign.address)).toString()
//     );
//     console.log(
//       "Dai Token balance lending pool: ",
//       (await daiToken.balanceOf(lendingPool.address)).toString()
//     );
//     console.log(
//         "Block number: ",
//         (await ethers.provider.getBlockNumber()).toString()
//       );

         
//     const depositRequest2 = await daiToken.connect(user2).transfer(campaign.address, 10000);
//     await depositRequest2.wait(1);

//     console.log("after transfer");
//     const depositTx2 = await lendingPool
//       .connect(campaign)
//       .deposit(daiToken.address, 10000, deployer.address, 0);
//     await depositTx2.wait(1);

//     moveBlocks(2);

//     console.log(
//       "Dai Token balance user1: ",
//       (await daiToken.balanceOf(user1.address)).toString()
//     );
//     console.log(
//       "Dai Token balance user2: ",
//       (await daiToken.balanceOf(user2.address)).toString()
//     );
//     console.log(
//       "Dai Token balance campaign: ",
//       (await daiToken.balanceOf(campaign.address)).toString()
//     );
//     console.log(
//       "Dai Token balance lending pool: ",
//       (await daiToken.balanceOf(lendingPool.address)).toString()
//     );

//     console.log(
//       "Deployer aDai token balance: ",
//       (await aDaiToken.balanceOf(deployer.address)).toString()
//     );
//     console.log(
//       "Block number: ",
//       (await ethers.provider.getBlockNumber()).toString()
//     );
   
   
//     const withdrawTx = await lendingPool.withdraw(
//       daiToken.address,
//       100000,
//       beneficiary.address
//     );
//     await withdrawTx.wait(1);

//     console.log(
//         "Dai Token balance user1: ",
//         (await daiToken.balanceOf(user1.address)).toString()
//       );
//       console.log(
//         "Dai Token balance user2: ",
//         (await daiToken.balanceOf(user2.address)).toString()
//       );
//       console.log(
//         "Dai Token balance campaign: ",
//         (await daiToken.balanceOf(campaign.address)).toString()
//       );
//       console.log(
//         "Dai Token balance lending pool: ",
//         (await daiToken.balanceOf(lendingPool.address)).toString()
//       );
  
//       console.log(
//         "Deployer aDai token balance: ",
//         (await aDaiToken.balanceOf(deployer.address)).toString()
//       );
//       console.log(
//         "Beneficiary aDai token balance: ",
//         (await daiToken.balanceOf(beneficiary.address)).toString()
//       );
//   }
// };

// export default deployMockDai;
// deployMockDai.tags = ["all", "mock"];
