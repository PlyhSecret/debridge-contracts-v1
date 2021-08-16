// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./AggregatorBase.sol";
import "../interfaces/ISignatureVerifier.sol";
import "../periphery/WrappedAsset.sol";
import "../libraries/SignatureUtil.sol";

contract SignatureVerifier is AggregatorBase, ISignatureVerifier {

    using SignatureUtil for bytes;
    using SignatureUtil for bytes32;

    /* ========== STATE VARIABLES ========== */

    uint8 public confirmationThreshold; // required confirmations per block after extra check enabled
    uint8 public excessConfirmations; // minimal required confirmations in case of too many confirmations

    uint40 public submissionsInBlock; //submissions count in current block
    uint40 public currentBlock; //Current block

    address public wrappedAssetAdmin; // admin for any deployed wrapped asset
    address public debridgeAddress; // Debridge gate address

    mapping(bytes32 => bytes32) public confirmedDeployInfo; // debridge Id => deploy Id
    mapping(bytes32 => DebridgeDeployInfo) public getDeployInfo; // mint id => debridge info
    mapping(bytes32 => address) public override getWrappedAssetAddress; // debridge id => wrapped asset address

    /* ========== MODIFIERS ========== */

    modifier onlyGate {
        require(msg.sender== debridgeAddress, "onlyGate: bad role");
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
        address _wrappedAssetAdmin,
        address _debridgeAddress
    ) public initializer {
        AggregatorBase.initializeBase(_minConfirmations);
        confirmationThreshold = _confirmationThreshold;
        excessConfirmations = _excessConfirmations;
        wrappedAssetAdmin = _wrappedAssetAdmin;
        debridgeAddress = _debridgeAddress;
    }

    /// @dev Confirms the transfer request.
    function confirmNewAsset(
        bytes memory _tokenAddress,
        uint256 _chainId,
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        bytes memory _signatures
    ) external {
        bytes32 debridgeId = getDebridgeId(_chainId, _tokenAddress);
        require(getWrappedAssetAddress[debridgeId] == address(0), "deployAsset: deployed already");

        bytes32 deployId = getDeployId(debridgeId, _name, _symbol, _decimals);
        DebridgeDeployInfo storage debridgeInfo = getDeployInfo[deployId];
        debridgeInfo.name = _name;
        debridgeInfo.symbol = _symbol;
        debridgeInfo.nativeAddress = _tokenAddress;
        debridgeInfo.chainId = _chainId;
        debridgeInfo.decimals = _decimals;

        // Count of required(DSRM) oracles confirmation
        uint256 currentRequiredOraclesCount;
        // stack variable to aggregate confirmations and write to storage once
        uint8 confirmations = debridgeInfo.confirmations;

        uint signaturesCount = _countSignatures(_signatures);
        address[] memory validators = new address[](signaturesCount);
        for (uint i = 0; i < signaturesCount; i++) {
            (bytes32 r, bytes32 s, uint8 v) = _parseSignature(_signatures, i);
            address oracle = ecrecover(deployId.getUnsignedMsg(), v, r, s);
            if(getOracleInfo[oracle].isValid) {
                for (uint256 k = 0; k < i; k++) {
                    require(validators[k] != oracle, "deployAsset: submitted already");
                }
                validators[i] = oracle;
                emit DeployConfirmed(deployId, oracle);
                confirmations += 1;
                if(getOracleInfo[oracle].required) {
                    currentRequiredOraclesCount += 1;
                }
            }
        }

        require(confirmations >= minConfirmations, "not confirmed");
        require(currentRequiredOraclesCount == requiredOraclesCount, "not confirmed by req oracles");

        debridgeInfo.confirmations = confirmations;
        confirmedDeployInfo[debridgeId] = deployId;
    }

    /// @dev Confirms the mint request.
    /// @param _submissionId Submission identifier.
    /// @param _signatures Array of signatures by oracles.
    function submit(bytes32 _submissionId, bytes memory _signatures, uint8 _excessConfirmations)
        external  override
        onlyGate
    {
        //Need confirmation to confirm submission
        uint8 needConfirmations = _excessConfirmations > minConfirmations ? _excessConfirmations : minConfirmations;
        // Count of required(DSRM) oracles confirmation
        uint256 currentRequiredOraclesCount;
        // stack variable to aggregate confirmations and write to storage once
        uint8 confirmations;
        uint signaturesCount = _countSignatures(_signatures);
        address[] memory validators = new address[](signaturesCount);
        for (uint i = 0; i < signaturesCount; i++) {
            (bytes32 r, bytes32 s, uint8 v) = _parseSignature(_signatures, i);
            address oracle = ecrecover(_submissionId.getUnsignedMsg(), v, r, s);
            if(getOracleInfo[oracle].isValid) {
                for (uint256 k = 0; k < i; k++) {
                    require(validators[k] != oracle, "duplicate signatures");
                }
                validators[i] = oracle;

                confirmations += 1;
                emit Confirmed(_submissionId, oracle);
                if(getOracleInfo[oracle].required) {
                    currentRequiredOraclesCount += 1;
                }
                if(confirmations >= needConfirmations
                    && currentRequiredOraclesCount >= requiredOraclesCount) {
                    break;
                }
            }
        }

        require(currentRequiredOraclesCount == requiredOraclesCount, "not confirmed by req oracles");

        if (confirmations >= minConfirmations) {
            if(currentBlock == uint40(block.number)){
                submissionsInBlock += 1;
            }
            else {
                currentBlock = uint40(block.number);
                submissionsInBlock = 1;
            }
            emit SubmissionApproved(_submissionId);
        }

        if(submissionsInBlock > confirmationThreshold) {
            require(confirmations >= excessConfirmations, "not confirmed" );
        }

        require(confirmations >= needConfirmations, "not confirmed" );
    }

    /* ========== deployAsset ========== */

    /// @dev deploy wrapped token, called by DeBridgeGate.
    function deployAsset(bytes32 _debridgeId)
            external override
            onlyGate
            returns (address wrappedAssetAddress, bytes memory nativeAddress, uint256 nativeChainId){
        bytes32 deployId = confirmedDeployInfo[_debridgeId];
        require(deployId != "", "deployAsset: not found deployId");

        DebridgeDeployInfo storage debridgeInfo = getDeployInfo[deployId];
        require(getWrappedAssetAddress[_debridgeId] == address(0), "deployAsset: deployed already");

        address[] memory minters = new address[](1);
        minters[0] = debridgeAddress;
        WrappedAsset wrappedAsset = new WrappedAsset(
            debridgeInfo.name,
            debridgeInfo.symbol,
            debridgeInfo.decimals,
            wrappedAssetAdmin,
            minters
        );
        getWrappedAssetAddress[_debridgeId] = address(wrappedAsset);
        emit DeployApproved(deployId);
        return (address(wrappedAsset), debridgeInfo.nativeAddress, debridgeInfo.chainId);
    }

    /* ========== ADMIN ========== */

    /// @dev Set admin for any deployed wrapped asset.
    /// @param _wrappedAssetAdmin Admin address.
    function setWrappedAssetAdmin(address _wrappedAssetAdmin) public onlyAdmin {
        wrappedAssetAdmin = _wrappedAssetAdmin;
    }

    /// @dev Sets core debridge conrtact address.
    /// @param _debridgeAddress Debridge address.
    function setDebridgeAddress(address _debridgeAddress) public onlyAdmin {
        debridgeAddress = _debridgeAddress;
    }

     /* ========== VIEW ========== */

    /// @dev Check is valid signature
    /// @param _submissionId Submission identifier.
    /// @param _signature signature by oracle.
    function isValidSignature(bytes32 _submissionId, bytes memory _signature)
        external view returns (bool)
    {
        (bytes32 r, bytes32 s, uint8 v) = _signature.splitSignature();
        address oracle = ecrecover(_submissionId.getUnsignedMsg(), v, r, s);
        return getOracleInfo[oracle].isValid;
    }

    /* ========== INTERNAL ========== */

    function _parseSignature(bytes memory _signatures, uint _pos)
             pure internal returns (bytes32 r, bytes32 s, uint8 v)
    {
        uint offset = _pos * 65;
        assembly {
            r := mload(add(_signatures, add(32, offset)))
            s := mload(add(_signatures, add(64, offset)))
            v := and(mload(add(_signatures, add(65, offset))), 0xff)
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Incorrect v");
    }

    function _countSignatures(bytes memory _signatures) pure internal returns (uint)
    {
        return _signatures.length % 65 == 0 ? _signatures.length / 65 : 0;
    }
}
