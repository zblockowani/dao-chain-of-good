// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract ChainOfGoodToken is ERC20Votes {
    uint256 public s_maxSupply;

    constructor() ERC20("ChainOfGood", "COG") ERC20Permit("ChainOfGood") {
        s_maxSupply = 1000000 * 10**18; // 1000000 CC
        _mint(msg.sender, s_maxSupply);
    }
}


