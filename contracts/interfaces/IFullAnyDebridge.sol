// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IFullAnyDebridge {
    function mint(
        address _tokenAddress,
        uint256 _chainId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce
    ) external;

    function claim(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce
    ) external;

    function mintWithOldAggregator(
        address _tokenAddress,
        uint256 _chainId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        uint8 _aggregatorVersion
    ) external;

    function claimWithOldAggregator(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        uint8 _aggregatorVersion
    ) external;
}
