export const MIN_DELAY = 3600;
export const VOTING_DELAY = 10;
export const VOTING_PERIOD = 100;
export const VOTING_THRESHOLD = 0;
export const QUORUM_PERCENTAGE = 4;

export const developmentChains = ["localhost", "hardhat"];

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const DEVELOPMENT_CHAINS = ["hardhat", "localhost"];

export const PROPOSALS_FILE_PATH = "proposals.json";
export const CREATED_CAMPAIGN_FILE_PATH = "campaigns.json";

export const CAMPAIGN_METADATA_URL =
  "ipfs://QmZEzNuysnpsdrmJupwQq8HMZvnWmEJDGYqftpDZX9NvH1";

export const FUNC = "createCampaign";
export const PROPOSAL_DESCRIPTION = "Create the first campaing";

export interface networkConfigItem {
  chainId: number;
  lendingPoolAddressProviderAddress?: string;
  beneficiaryAddress?: string;
  capaignTokenAddress?: string;
  blockConfirmation?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  hardhat: {
    chainId: 31337,
    lendingPoolAddressProviderAddress: "",
    beneficiaryAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    capaignTokenAddress: "",
  },

  localhost: {
    chainId: 31337,
    lendingPoolAddressProviderAddress: "",
    beneficiaryAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    capaignTokenAddress: "",
  },
  mumbai: {
    chainId: 80001,
    lendingPoolAddressProviderAddress:
      "0x178113104fEcbcD7fF8669a0150721e231F0FD4B",
    beneficiaryAddress: "",
    capaignTokenAddress: "",
    blockConfirmation: 6,
  },
  kovan: {
    chainId: 42,
    lendingPoolAddressProviderAddress:
      "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
    beneficiaryAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    capaignTokenAddress: "0x04DF6e4121c27713ED22341E7c7Df330F56f289B",
    blockConfirmation: 6,
  },
};
