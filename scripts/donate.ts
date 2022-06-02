import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  CREATED_CAMPAIGN_FILE_PATH,
  networkConfig,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { Contract } from "ethers";
const donate = async (campaignAddress: string) => {
  const [, donorOne, donorTwo, charity] = await ethers.getSigners();
  const campaign = await ethers.getContractAt("Campaign", campaignAddress);
  const daiToken = await ethers.getContract("MockDaiToken");
  const aDaiToken = await ethers.getContract("MockADaiToken");

  const startBlock = (await campaign.s_info()).startBlock.toString();
  let currentBlock = await ethers.provider.getBlockNumber();
  await moveBlocks(startBlock - currentBlock);
  console.log("Campaign is on you can start to donate!");
  console.log("Donor one approving tokens...");
  const donorOneApprovalTx = await daiToken
    .connect(donorOne)
    .approve(campaign.address, 100000);
  await donorOneApprovalTx.wait(1);

  console.log("DonorOne's tokens are approved!");

  const donorOneDonationTx = await campaign.connect(donorOne).donate(10000);
  await donorOneDonationTx.wait(1);

  console.log(`Campaign info: ${await campaign.s_info()}`);

  moveBlocks(10);

  console.log("Some profits have been generated!");

  await checkStatus(campaign, aDaiToken);

  console.log("DonorTwo approving tokens...");

  const donorTwoApprovalTx = await daiToken
    .connect(donorTwo)
    .approve(campaign.address, 10000);
  await donorTwoApprovalTx.wait(1);

  console.log("DonorTwo's tokens are approved!");

  console.log("DonorTwo is donating...");
  const donorTwoDonation = 1000;
  const donorTwoDonationTx = await campaign
    .connect(donorTwo)
    .donate(donorTwoDonation);
  await donorTwoDonationTx.wait(1);

  console.log(`DonorTwo has donated ${donorTwoDonation} DAI`);

  await checkStatus(campaign, aDaiToken);

  console.log("Time is passing...");
  await moveBlocks(40);

  await checkStatus(campaign, aDaiToken);

  console.log("DonorOne is withdrawing...");
  const withdrawAmount = 5000;
  const donorOneWithdrawTx = await campaign
    .connect(donorOne)
    .withdraw(withdrawAmount);
  await donorOneWithdrawTx.wait(1);
  console.log(`DonorOne has withdraw ${withdrawAmount}`);

  await checkStatus(campaign, aDaiToken);

  const endBlock = (await campaign.s_info()).endBlock.toString();
  currentBlock = await ethers.provider.getBlockNumber();
  ("Time is passing...");
  await moveBlocks(endBlock - currentBlock);
  console.log("The time is over and the campaign can be ended!");

  console.log("Ending campaing...");
  const endCampaingTx = await campaign.endCampaign();
  endCampaingTx.wait(1);
  console.log(
    "Campaing has been ended and founds has been passed to the charity account!"
  );

  await checkStatus(campaign, aDaiToken);

  console.log(
    `Charity wallet founds: ${await daiToken.balanceOf(charity.address)}`
  );

  console.log("Donor one is withdrawing rest of their founds...");
  const restFounds = 5000;
  const donorOneWithdrawRestTx = await campaign
    .connect(donorOne)
    .withdraw(restFounds);
  await donorOneWithdrawRestTx.wait(1);

  console.log(`DonorOne has withdraw ${restFounds}`);

  await checkStatus(campaign, aDaiToken);

  console.log("DonorTwo is splitting his founds...");
  const amount = 500;
  const donorTwoSplitFoundsTx = await campaign
    .connect(donorTwo)
    .foundCharityWalletAndGetBackRest(amount);
  await donorTwoSplitFoundsTx.wait(1);

  console.log(
    `DonorTwo has given ${amount} to charity and get back ${amount}!`
  );
  console.log(
    `Charity wallet founds: ${await daiToken.balanceOf(charity.address)}`
  );
  await checkStatus(campaign, aDaiToken);
};

const checkStatus = async (campaign: Contract, aDaiToken: Contract) => {
  console.log(`Campaign info: ${await campaign.s_info()}`);
  let donationPool = (await campaign.s_info()).donationPool;
  let aTokenBalance = await aDaiToken.balanceOf(campaign.address);
  console.log(`Generated profits: ${aTokenBalance - donationPool}`);
};

const campaigns = JSON.parse(
  fs.readFileSync(CREATED_CAMPAIGN_FILE_PATH, "utf8")
);
const networkName = network.name as keyof typeof networkConfig;
const chainId = networkConfig[networkName].chainId;

const campaignAddress =
  campaigns[chainId][campaigns[chainId].length - 1].address;

donate(campaignAddress)
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
