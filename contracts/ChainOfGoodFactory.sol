// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IlendingPoolAddressProvider.sol";
import "./Campaign.sol";

contract ChainOfGoodFactory is Ownable {
    ILendingPoolAddressProvider public s_lendingPoolAddressProvider;
    address[] public s_campaigns;

    event CampaignCreated(
        address addr,
        uint256 startBlock,
        uint256 endBlock,
        address tokenAddress,
        address indexed beneficiaryWallet
    );

    constructor(address _lendingPoolAddressProvider) {
        s_lendingPoolAddressProvider = ILendingPoolAddressProvider(
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
        address lendingPool = s_lendingPoolAddressProvider.getLendingPool();
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
}
