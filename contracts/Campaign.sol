// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./ILendingPool.sol";

contract Campaign {
    struct Info {
        address beneficiaryWallet;
        uint256 startBlock;
        uint256 endBlock;
        uint256 donationPool;
        uint256 collectedReward;
        uint256 additionalPassedFounds;
        string metadataUrl;
    }

    bool public s_campaignEnded;
    IERC20 public s_token;
    ILendingPool public s_lendingPool;
    Info public s_info;

    mapping(address => uint) public s_donorsToDonation;

    event Donated(address indexed who, uint256 amount);
    event Withdrawn(address indexed who, uint256 amount);
    event CampaignEnded(uint256 collectedFounds);

    constructor(
        uint256 _startBlock,
        uint256 _endBlock,
        address _tokenAddress,
        address _lendingPoolAddress,
        address _beneficiaryWallet,
        string memory _metadataUrl
    ) {
        Info memory info;
        info.beneficiaryWallet = _beneficiaryWallet;
        info.startBlock = _startBlock;
        info.endBlock = _endBlock;
        info.metadataUrl = _metadataUrl;
        s_info = info;

        s_token = IERC20(_tokenAddress);
        s_lendingPool = ILendingPool(_lendingPoolAddress);

        s_token.approve(address(_lendingPoolAddress), type(uint256).max);
    }

    function donate(uint256 _amount) external {
        require(
            block.number >= s_info.startBlock && block.number < s_info.endBlock,
            "The campaign is not in progress."
        );

        s_info.donationPool += _amount;
        s_donorsToDonation[msg.sender] += _amount;

        s_token.transferFrom(msg.sender, address(this), _amount);
        s_lendingPool.deposit(address(s_token), _amount, address(this), 0);

        emit Donated(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(
            _amount <= s_donorsToDonation[msg.sender],
            "Your donation is less than your requested withdraw."
        );

        s_info.donationPool -= _amount;
        s_donorsToDonation[msg.sender] -= _amount;

        if (!s_campaignEnded) {
            s_lendingPool.withdraw(
                address(s_token),
                _amount,
                address(msg.sender)
            );
        } else {
            s_token.transfer(msg.sender, _amount);
        }

        emit Withdrawn(msg.sender, _amount);
    }

    function foundCharityWalletAndGetBackRest(uint256 _amount) external {
        require(
            _amount <= s_donorsToDonation[msg.sender],
            "Your donation is less than your requested withdraw."
        );
        require(s_campaignEnded, "The campaign has to be ended.");
        uint256 difference = s_donorsToDonation[msg.sender] - _amount;

        s_info.donationPool -= s_donorsToDonation[msg.sender];
        s_donorsToDonation[msg.sender] = 0;
        s_info.additionalPassedFounds += _amount;

        s_token.transfer(s_info.beneficiaryWallet, _amount);

        if (difference > 0) {
            s_token.transfer(msg.sender, difference);
        }
    }

    function endCampaign() external {
        require(
            block.number > s_info.endBlock,
            "The campaign hasn't ended yet"
        );
        require(!s_campaignEnded, "The campaing has been already ended!");
        s_campaignEnded = true;

        uint256 reward = s_lendingPool.withdraw(
            address(s_token),
            type(uint256).max,
            address(this)
        );
        s_info.collectedReward = reward - s_info.donationPool;

        s_token.transfer(s_info.beneficiaryWallet, s_info.collectedReward);

        emit CampaignEnded(s_info.collectedReward);
    }
}
