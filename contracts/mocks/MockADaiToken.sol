// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MockADaiToken is ERC20 {
    mapping(address => uint256) public s_transferBlock;
    mapping(address => uint256) s_balances;

    constructor() ERC20("MockDaiToken", "MDAI") {}

    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        uint256 passedBlocks = block.number - s_transferBlock[account];
        uint256 multiplier = s_balances[account] == 0 ? 0 : passedBlocks;

        console.log("Multiplier: ", multiplier);
        console.log("PassedBlocks: ", passedBlocks);
        console.log("Stored balance: ", s_balances[account]);
        console.log("Transfere block ", s_transferBlock[account]);
        console.log("BLock number: ", block.number);

        uint256 balance = s_balances[account] +
            ((s_balances[account] * multiplier * 1) / 1000);

        console.log("Balance: ", balance);
        //0,01% interest rate per block
        return balance;
    }

    function mint(address _user, uint256 _amount) external {
        s_balances[_user] = balanceOf(_user) + _amount;
        s_transferBlock[_user] = block.number;
    }

    function burn(address _user, uint256 _amount) external {
        s_balances[_user] = balanceOf(_user) - _amount;
        s_transferBlock[_user] = block.number;
    }
}
