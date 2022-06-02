import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  DEVELOPMENT_CHAINS,
  networkConfig,
  PROPOSALS_FILE_PATH,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import {PROPOSAL_STATE} from '../utils/proposal-state';

export const vote = async (proposalId: string) => {
  console.log("Voting...");
  const governor = await ethers.getContract("ChainOfGoodGovernor");

  let proposalState = await governor.state(proposalId);

  console.log(`Proposal state: ${PROPOSAL_STATE[proposalState]}`);
  
  const voteWay = 1;
  const voteTx = await governor.castVoteWithReason(
    proposalId,
    voteWay,
    "Because we can!"
  );
  await voteTx.wait(1);

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }

  proposalState = await governor.state(proposalId);
  console.log(`Proposal state: ${PROPOSAL_STATE[proposalState]}`);

  console.log("Voting has been completed!");
};



const proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE_PATH, "utf8"));
const networkName = network.name as keyof typeof networkConfig;
const chainId = networkConfig[networkName].chainId;
console.log(chainId);
const proposalId = proposals[chainId][proposals["42"].length - 1].proposalId;

vote(proposalId)
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
