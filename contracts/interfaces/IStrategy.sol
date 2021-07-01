// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IStrategy {
    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
    function getRewardBalance(address account, address token) 
        external 
        view 
        returns(uint256);
    function getAssetBalance(address account, address token) 
        external 
        view 
        returns(uint256);
}