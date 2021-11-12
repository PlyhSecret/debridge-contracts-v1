// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "./AggregatorBase.sol";
import "../interfaces/ISignatureVerifier.sol";
import "../libraries/SignatureUtil.sol";

contract SignatureVerifier is AggregatorBase, ISignatureVerifier {
    using SignatureUtil for bytes;
    using SignatureUtil for bytes32;

    /* ========== STATE VARIABLES ========== */

    uint256 public confirmationThreshold; // required confirmations per epoch after extra check enabled

    uint256 public submissionsInEpoch; // number of submissions in current epoch
    uint256 public epoch; // Current epoch

    address public debridgeAddress; // Debridge gate address
    uint256 public secondsInEpoch; // number of seconds in one epoch

    /* ========== ERRORS ========== */

    error NotConfirmedByRequiredOracles();
    error NotConfirmedThreshold();
    error SubmissionNotConfirmed();
    error DuplicateSignatures();

    /* ========== MODIFIERS ========== */

    modifier onlyDeBridgeGate() {
        if (msg.sender != debridgeAddress) revert DeBridgeGateBadRole();
        _;
    }

    /* ========== CONSTRUCTOR  ========== */

    /// @dev Constructor that initializes the most important configurations.
    /// @param _minConfirmations Common confirmations count.
    /// @param _confirmationThreshold Confirmations per block after extra check enabled.
    /// @param _excessConfirmations Confirmations count in case of excess activity.
    function initialize(
        uint8 _minConfirmations,
        uint8 _confirmationThreshold,
        uint8 _excessConfirmations,
        uint256 _secondsInEpoch,
        address _debridgeAddress
    ) public initializer {
        AggregatorBase.initializeBase(_minConfirmations, _excessConfirmations);
        secondsInEpoch = _secondsInEpoch;
        confirmationThreshold = _confirmationThreshold;
        debridgeAddress = _debridgeAddress;
    }


    /// @dev Check is valid signatures.
    /// @param _submissionId Submission identifier.
    /// @param _signatures Array of signatures by oracles.
    /// @param _excessConfirmations override min confirmations count
    function submit(
        bytes32 _submissionId,
        bytes memory _signatures,
        uint8 _excessConfirmations
    ) external override onlyDeBridgeGate {
        //Need confirmation to confirm submission
        uint8 needConfirmations = _excessConfirmations > minConfirmations
            ? _excessConfirmations
            : minConfirmations;
        // Count of required(DSRM) oracles confirmation
        uint256 currentRequiredOraclesCount;
        // stack variable to aggregate confirmations and write to storage once
        uint8 confirmations;
        uint256 signaturesCount = _countSignatures(_signatures);
        address[] memory validators = new address[](signaturesCount);
        for (uint256 i = 0; i < signaturesCount; i++) {
            (bytes32 r, bytes32 s, uint8 v) = _signatures.parseSignature(i * 65);
            address oracle = ecrecover(_submissionId.getUnsignedMsg(), v, r, s);
            if (getOracleInfo[oracle].isValid) {
                for (uint256 k = 0; k < i; k++) {
                    if (validators[k] == oracle) revert DuplicateSignatures();
                }
                validators[i] = oracle;

                confirmations += 1;
                emit Confirmed(_submissionId, oracle);
                if (getOracleInfo[oracle].required) {
                    currentRequiredOraclesCount += 1;
                }
                if (
                    confirmations >= needConfirmations &&
                    currentRequiredOraclesCount >= requiredOraclesCount
                ) {
                    break;
                }
            }
        }

        if (currentRequiredOraclesCount != requiredOraclesCount)
            revert NotConfirmedByRequiredOracles();

        if (confirmations >= minConfirmations) {
            // TODO: don't update submissionsInEpoch when verifying new asset deploy
            uint256 currentEpoch = block.timestamp % secondsInEpoch;
            if (epoch == currentEpoch) {
                submissionsInEpoch += 1;
            } else {
                epoch = currentEpoch;
                submissionsInEpoch = 1;
            }
            emit SubmissionApproved(_submissionId);
        }

        if (submissionsInEpoch > confirmationThreshold) {
            if (confirmations < excessConfirmations) revert NotConfirmedThreshold();
        }

        if (confirmations < needConfirmations) revert SubmissionNotConfirmed();
    }

    /* ========== ADMIN ========== */

    /// @dev Sets minimal required confirmations.
    /// @param _confirmationThreshold Confirmation info.
    function setThreshold(uint8 _confirmationThreshold) external onlyAdmin {
        if (_confirmationThreshold == 0) revert WrongArgument();
        confirmationThreshold = _confirmationThreshold;
    }

    /// @dev Sets number of seconds in one epoch.
    /// @param _secondsInEpoch New number of seconds in one epoch
    function setSecondsInEpoch(uint256 _secondsInEpoch) external onlyAdmin {
        if (_secondsInEpoch == 0) revert WrongArgument();
        secondsInEpoch = _secondsInEpoch;
    }

    /// @dev Sets core debridge conrtact address.
    /// @param _debridgeAddress Debridge address.
    function setDebridgeAddress(address _debridgeAddress) external onlyAdmin {
        debridgeAddress = _debridgeAddress;
    }

    /* ========== VIEW ========== */

    /// @dev Check is valid signature
    /// @param _submissionId Submission identifier.
    /// @param _signature signature by oracle.
    function isValidSignature(bytes32 _submissionId, bytes memory _signature)
        external
        view
        returns (bool)
    {
        (bytes32 r, bytes32 s, uint8 v) = _signature.splitSignature();
        address oracle = ecrecover(_submissionId.getUnsignedMsg(), v, r, s);
        return getOracleInfo[oracle].isValid;
    }

    /* ========== INTERNAL ========== */

    function _countSignatures(bytes memory _signatures) internal pure returns (uint256) {
        return _signatures.length % 65 == 0 ? _signatures.length / 65 : 0;
    }

    // ============ Version Control ============
    function version() external pure returns (uint256) {
        return 102; // 1.0.2
    }
}
