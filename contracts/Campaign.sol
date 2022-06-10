// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./ILendingPool.sol";

error Campaign__NotInProgress(
    uint256 _currentBlock,
    uint256 _startBlock,
    uint256 _endBlock
);
error Campaing__WrongWithdrawRequested(
    address _who,
    uint256 _requested,
    uint256 _availableFounds
);
error Campaing__NotEnded(uint256 _currentBlock, uint256 _endBlock);
error Campaing__Endend();

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
    IERC20 private i_token;
    ILendingPool private i_lendingPool;

    bool private s_campaignEnded;
    Info private s_info;

    mapping(address => uint) private s_donorsToDonation;

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

        i_token = IERC20(_tokenAddress);
        i_lendingPool = ILendingPool(_lendingPoolAddress);

        i_token.approve(address(_lendingPoolAddress), type(uint256).max);
    }

    //Require approval from msg.sender on the token contract
    function donate(uint256 _amount) external {
        if (
            block.number < s_info.startBlock || block.number > s_info.endBlock
        ) {
            revert Campaign__NotInProgress(
                block.number,
                s_info.startBlock,
                s_info.endBlock
            );
        }

        s_info.donationPool += _amount;
        s_donorsToDonation[msg.sender] += _amount;

        i_token.transferFrom(msg.sender, address(this), _amount);
        i_lendingPool.deposit(address(i_token), _amount, address(this), 0);

        emit Donated(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        if (_amount > s_donorsToDonation[msg.sender]) {
            revert Campaing__WrongWithdrawRequested(
                msg.sender,
                _amount,
                s_donorsToDonation[msg.sender]
            );
        }

        s_info.donationPool -= _amount;
        s_donorsToDonation[msg.sender] -= _amount;

        if (!s_campaignEnded) {
            i_lendingPool.withdraw(
                address(i_token),
                _amount,
                address(msg.sender)
            );
        } else {
            i_token.transfer(msg.sender, _amount);
        }

        emit Withdrawn(msg.sender, _amount);
    }

    function foundCharityWalletAndGetBackRest(uint256 _amount) external {
        if (_amount > s_donorsToDonation[msg.sender]) {
            revert Campaing__WrongWithdrawRequested(
                msg.sender,
                _amount,
                s_donorsToDonation[msg.sender]
            );
        }
        if (!s_campaignEnded) {
            revert Campaing__NotEnded(block.number, s_info.endBlock);
        }
        uint256 difference = s_donorsToDonation[msg.sender] - _amount;

        s_info.donationPool -= s_donorsToDonation[msg.sender];
        s_donorsToDonation[msg.sender] = 0;
        s_info.additionalPassedFounds += _amount;

        i_token.transfer(s_info.beneficiaryWallet, _amount);

        if (difference > 0) {
            i_token.transfer(msg.sender, difference);
        }
    }

    function endCampaign() external {
        if (s_campaignEnded) {
            revert Campaing__Endend();
        }
        if (block.number <= s_info.endBlock) {
            revert Campaing__NotEnded(block.number, s_info.endBlock);
        }
        s_campaignEnded = true;

        uint256 reward = i_lendingPool.withdraw(
            address(i_token),
            type(uint256).max,
            address(this)
        );
        s_info.collectedReward = reward - s_info.donationPool;

        i_token.transfer(s_info.beneficiaryWallet, s_info.collectedReward);

        emit CampaignEnded(s_info.collectedReward);
    }

    function getInfo() external view returns (Info memory) {
        return s_info;
    }

    function getDonorDonation(address _donor) external view returns (uint256) {
        return s_donorsToDonation[_donor];
    }
}
