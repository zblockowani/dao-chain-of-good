import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  CAMPAIGN_METADATA_URL,
  DEVELOPMENT_CHAINS,
  FUNC,
  networkConfig,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import {ChainOfGoodGovernor} from '../typechain-types';

export const propose = async (functionCall: string, proposalDescription: string) => {
  const governor: ChainOfGoodGovernor = await ethers.getContract("ChainOfGoodGovernor");
  const factory = await ethers.getContract("ChainOfGoodFactory");

  console.log("Creating proposal...");

  let tokenAddress;
  const networkName = network.name as keyof typeof networkConfig;

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const campaignToken = await ethers.getContract("MockDaiToken");
    tokenAddress = campaignToken.address;
  } else {
    tokenAddress = networkConfig[networkName].capaignTokenAddress;
  }

  const beneficiaryAddress = networkConfig[networkName].beneficiaryAddress;

  const currentBlock: number = (await ethers.provider.getBlock("latest"))
    .number;

  //Campaign will be on for 100 blocks after voting (10 blocks buffor for execution)
  const startBlock = currentBlock + VOTING_DELAY + VOTING_PERIOD + 10;
  const endBlock = currentBlock + VOTING_DELAY + VOTING_PERIOD + 110;

  const args = [
    startBlock,
    endBlock,
    tokenAddress,
    beneficiaryAddress,
    CAMPAIGN_METADATA_URL,
  ];

  const encodedFunctionCall = factory.interface.encodeFunctionData(
    functionCall,
    args
  );

  const proposeTx = await governor.propose(
    [factory.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeResponse = await proposeTx.wait(1);

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposalId = proposeResponse.events![0].args!.proposalId;
  saveProposalId(proposalId, encodedFunctionCall);

  console.log("Proposal is ready for voting!");
};

const saveProposalId = (proposalId: string, encodedFunctionCall: string) => {
  const proposals = JSON.parse(fs.readFileSync("proposals.json", "utf8"));
  proposals[network.config.chainId!.toString()].push({proposalId: proposalId.toString(), encodedFunctionCall: encodedFunctionCall});
  fs.writeFileSync("proposals.json", JSON.stringify(proposals));
};

propose(FUNC, PROPOSAL_DESCRIPTION)
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
