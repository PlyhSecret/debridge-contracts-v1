// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ICallProxy {
    function call(address _receiver, bytes memory _data) external payable;
}
