import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  CREATED_CAMPAIGN_FILE_PATH,
  networkConfig,
} from "../helper-hardhat-config";

const getCampaignsData = async () => {

  console.log("Waiting for new campaigns...")
  
  const campaigns: any = JSON.parse(
    fs.readFileSync(CREATED_CAMPAIGN_FILE_PATH, "utf8")
  );
  const networkName = network.name as keyof typeof networkConfig;
  const chainId = networkConfig[networkName].chainId;

  const factory = await ethers.getContract("ChainOfGoodFactory");
  factory.on("CampaignCreated", (addr) => {
    const campaign = campaigns[chainId].find((c: any) => c.address === addr);

    if (!campaign) {
      console.log("New campaign has been created!");
      campaigns[chainId].push({ address: addr });
    }

    fs.writeFileSync(CREATED_CAMPAIGN_FILE_PATH, JSON.stringify(campaigns));
  });
};

getCampaignsData();
