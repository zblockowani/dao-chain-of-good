import { network } from "hardhat";
import {
  FUNC,
  networkConfig,
  PROPOSALS_FILE_PATH,
  PROPOSAL_DESCRIPTION,
} from "../helper-hardhat-config";
import { propose } from "./propose-campaign";
import { queueAndExecute } from "./queue-and-execute";
import { vote } from "./vote";
import * as fs from "fs";

const create = async () => {
  

  await propose(FUNC, PROPOSAL_DESCRIPTION);

  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE_PATH, "utf8"));
  const networkName = network.name as keyof typeof networkConfig;
  const chainId = networkConfig[networkName].chainId;
  const proposalId =
    proposals[chainId][proposals[chainId].length - 1].proposalId;

  await vote(proposalId);

  const proposal: any = proposals[chainId][proposals[chainId].length - 1];

  console.log(proposal);
  await queueAndExecute(
    proposal.encodedFunctionCall!,
    proposal.proposalId!,
    PROPOSAL_DESCRIPTION
  );
};

create()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });


  const saveProposalId = (proposalId: string, encodedFunctionCall: string) => {
    const proposals = JSON.parse(fs.readFileSync("proposals.json", "utf8"));
    proposals[network.config.chainId!.toString()].push({
      proposalId: proposalId.toString(),
      encodedFunctionCall: encodedFunctionCall,
    });
    fs.writeFileSync("proposals.json", JSON.stringify(proposals));
  };