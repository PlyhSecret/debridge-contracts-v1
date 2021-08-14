// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../transfers/SignatureVerifier.sol";
import "../libraries/SignatureUtil.sol";
import "hardhat/console.sol";

contract MockSignatureVerifier is SignatureVerifier{

    using SignatureUtil for bytes;
    using SignatureUtil for bytes32;

    event RSV(bytes32 r, bytes32 s, uint8 v);

    /// @dev Constructor that initializes the most important configurations.
    /// @param _minConfirmations Common confirmations count.
    /// @param _confirmationThreshold Confirmations per block before extra check enabled.
    /// @param _excessConfirmations Confirmations count in case of excess activity.
    function initializeMock(
        uint8 _minConfirmations,
        uint8 _confirmationThreshold,
        uint8 _excessConfirmations,
        address _wrappedAssetAdmin,
        address _debridgeAddress
    ) public initializer {
        SignatureVerifier.initialize(_minConfirmations,
                                    _confirmationThreshold,
                                    _excessConfirmations,
                                    _wrappedAssetAdmin,
                                    _debridgeAddress);

    }

    /// @dev method for testing gas without storage modification
    /// @param _submissionId Submission identifier.
    /// @param _signatures Array of signatures by oracles.
    function testGas(bytes32 _submissionId, bytes[] memory _signatures)
        external
        returns (uint16 _confirmations, bytes32 unsignedMsg)
    {
        // stack variable to aggregate confirmations and write to storage once
        uint16 confirmations = 0;
        bytes32 unsignedMsg = _submissionId.getUnsignedMsg();

        for (uint256 i = 0; i < _signatures.length; i++) {
            // bytes32 r = 0xf4c2d023fea0854e07469c361de66b7a9d73eed0731775d9bc80d7e6350585c2;
            // bytes32 s = 0x3e593584487ebb76b7446360e6926ef30fb0df30c3dc8a2251efdd7037feafdf;
            // uint8 v = 0x1c;
            (bytes32 r, bytes32 s, uint8 v) =  _signatures[i].splitSignature();
            // console.log("r %s",  r);
            // console.log("s %s",  s);
            // console.log("v %s",  v);
            // emit RSV(r, s, v);
            address oracle = ecrecover(unsignedMsg, v, r, s);
            confirmations += 1;
        }

        return (
            confirmations,
            unsignedMsg
        );
    }
}
