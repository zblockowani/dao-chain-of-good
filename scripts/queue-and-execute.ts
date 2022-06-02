import { ethers, network } from "hardhat";
import {
  CAMPAIGN_METADATA_URL,
  DEVELOPMENT_CHAINS,
  FUNC,
  MIN_DELAY,
  networkConfig,
  PROPOSALS_FILE_PATH,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import * as fs from "fs";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";
import { PROPOSAL_STATE } from "../utils/proposal-state";

export const queueAndExecute = async (
  encodedFunctionCall: string,
  proposalId: string,
  proposalDescription: string
) => {
  const governor = await ethers.getContract("ChainOfGoodGovernor");
  const factory = await ethers.getContract("ChainOfGoodFactory");
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(proposalDescription)
  );

  const queueTx = await governor.queue(
    [factory.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  queueTx.wait(1);

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    await moveTime(MIN_DELAY);
    await moveBlocks(1);
  }
  console.log("Proposal has been queued and  is ready to be executed!");

  let proposalState = await governor.state(proposalId);

  console.log(`Proposal state: ${PROPOSAL_STATE[proposalState]}`);

  console.log("Execution of the proposal...");

  const executeTx = await governor.execute(
    [factory.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  executeTx.wait(1);

  console.log("Proposal has been executed!");
  proposalState = await governor.state(proposalId);

  console.log(`Proposal state: ${PROPOSAL_STATE[proposalState]}`);
};

const proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE_PATH, "utf8"));
const networkName = network.name as keyof typeof networkConfig;
const chainId = networkConfig[networkName].chainId;

const proposal = proposals[chainId][proposals[chainId].length - 1];

queueAndExecute(
  proposal.encodedFunctionCall,
  proposal.proposalId,
  PROPOSAL_DESCRIPTION
)
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
