// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./MockADaiToken.sol";

contract MockLendingPool {
    MockADaiToken s_aToken;
    IERC20 s_token;

    constructor(address _mockATokenAddress, address _mockTokenAddress) {
        s_aToken = MockADaiToken(_mockATokenAddress);
        s_token = IERC20(_mockTokenAddress);
    }

    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        s_token.transferFrom(msg.sender, address(this), amount);
        s_aToken.mint(onBehalfOf, amount);
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        uint256 aTokenBalance = s_aToken.balanceOf(msg.sender);
        if (aTokenBalance < amount) {
            s_token.transfer(to, aTokenBalance);
            s_aToken.burn(msg.sender, aTokenBalance);

            return aTokenBalance;
        } else {
            s_token.transfer(to, amount);
            s_aToken.burn(msg.sender, amount);
            return amount;
        }
    }
}
