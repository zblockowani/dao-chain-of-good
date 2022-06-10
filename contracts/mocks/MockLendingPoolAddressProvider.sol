// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "../ILendingPoolAddressProvider.sol";

contract MockLendingPoolAddressProvider is ILendingPoolAddressProvider {
    address s_lendingPoolAddress;

    constructor(address _lendingPoolAddress) {
        s_lendingPoolAddress = _lendingPoolAddress;
    }

    function getLendingPool() external view returns (address) {
        return s_lendingPoolAddress;
    }
}
