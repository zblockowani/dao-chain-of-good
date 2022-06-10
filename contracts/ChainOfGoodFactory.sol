// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ILendingPoolAddressProvider.sol";
import "./Campaign.sol";

contract ChainOfGoodFactory is Ownable {
    ILendingPoolAddressProvider immutable i_lendingPoolAddressProvider;

    address[] public s_campaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        uint256 startBlock,
        uint256 endBlock,
        address tokenAddress,
        address indexed beneficiaryWallet
    );

    constructor(address _lendingPoolAddressProvider) {
        i_lendingPoolAddressProvider = ILendingPoolAddressProvider(
            _lendingPoolAddressProvider
        );
    }

    function createCampaign(
        uint256 _startBlock,
        uint256 _endBlock,
        address _token,
        address _beneficiaryWallet,
        string memory _metadataUrl
    ) external onlyOwner {
        address lendingPool = i_lendingPoolAddressProvider.getLendingPool();
        Campaign campaing = new Campaign(
            _startBlock,
            _endBlock,
            _token,
            lendingPool,
            _beneficiaryWallet,
            _metadataUrl
        );
        s_campaigns.push(address(campaing));

        emit CampaignCreated(
            address(campaing),
            _startBlock,
            _endBlock,
            _token,
            _beneficiaryWallet
        );
    }

    function getCampaigns() external view returns (address[] memory) {
        return s_campaigns;
    }
}
