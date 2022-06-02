// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDaiToken is ERC20 {
    constructor() ERC20("MockDaiToken", "MDAI") {
        _mint(msg.sender, 1000000 * 1e18);
    }
}
