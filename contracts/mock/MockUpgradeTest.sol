// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MockSignatureVerifierUpgradeV1 is Initializable, AccessControlUpgradeable {

    uint8 private confirmationThreshold;
    uint40 public submissionsInEpoch; // number of submissions in current epoch
    uint40 public epoch; // Current epoch

    address public debridgeAddress; // Debridge gate address

    function initialize(
        uint8 _confirmationThreshold
    ) public initializer {
        confirmationThreshold = _confirmationThreshold;
    }

    function setThreshold(uint8 _confirmationThreshold) external {
        confirmationThreshold = _confirmationThreshold;
    }
}

contract MockSignatureVerifierUpgradeV2 {

    uint256 private confirmationThreshold;
    uint256 public submissionsInEpoch; // number of submissions in current epoch
    uint256 public epoch; // Current epoch

    address public debridgeAddress; // Debridge gate address
    uint256 public secondsInEpoch; // number of seconds in one epoch

    function initialize(
        uint8 _confirmationThreshold
    ) public initializer {
        confirmationThreshold = _confirmationThreshold;
    }

    function setThreshold(uint8 _confirmationThreshold) external {
        confirmationThreshold = _confirmationThreshold;
    }
}
