// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IStrategy {
    function deposit(address _asset) external;

    function withdraw(
        address _asset,
        uint256 _amount,
        address _receiver
    ) external;
}
