// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../interfaces/ILightVerifier.sol";
import "../interfaces/ILightDebridge.sol";
import "./Debridge.sol";

contract LightDebridge is Debridge, ILightDebridge {
    /// @dev Constructor that initializes the most important configurations.
    /// @param _minAmount Minimal amount of current chain token to be wrapped.
    /// @param _maxAmount Maximum amount of current chain token to be wrapped.
    /// @param _minReserves Minimal reserve ratio.
    /// @param _aggregator Submission aggregator address.
    /// @param _supportedChainIds Chain ids where native token of the current chain can be wrapped.
    function initialize(
        uint256 _excessConfirmations,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _minReserves,
        uint256 _amountThreshold,
        address _aggregator,
        address _callProxy,
        uint256[] memory _supportedChainIds,
        ChainSupportInfo[] memory _chainSupportInfo,
        IDefiController _defiController
    ) public payable initializer {
        super._initialize(
            _excessConfirmations,
            _minAmount,
            _maxAmount,
            _minReserves,
            _amountThreshold,
            _aggregator,
            _callProxy,
            _supportedChainIds,
            _chainSupportInfo,
            _defiController
        );
    }

    /// @dev Mints wrapped asset on the current chain.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: without applyed fee).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _fallbackAddress Receiver of the tokens if the call fails.
    /// @param _executionFee Fee paid to the transaction executor.
    /// @param _data Chain id of the target chain.
    function autoMint(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        address _fallbackAddress,
        uint256 _executionFee,
        bytes memory _data
    ) external {
        bytes32 submissionId = getAutoSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce,
            _fallbackAddress,
            _executionFee,
            _data
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(aggregator)
            .submit(submissionId, _signatures);
            require(confirmed, "autoMint: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "autoMint: amount not confirmed"
                );
            }
        }
        _mint(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            _fallbackAddress,
            _executionFee,
            _data
        );
    }

    /// @dev Mints wrapped asset on the current chain.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: without applyed fee).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _fallbackAddress Receiver of the tokens if the call fails.
    /// @param _executionFee Fee paid to the transaction executor.
    /// @param _data Chain id of the target chain.
    function autoMintWithOldAggregator(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        address _fallbackAddress,
        uint256 _executionFee,
        bytes memory _data,
        uint8 _aggregatorVersion
    ) external {
        bytes32 submissionId = getAutoSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce,
            _fallbackAddress,
            _executionFee,
            _data
        );
        require(
            getOldAggregator[_aggregatorVersion].isValid,
            "mintWithOldAggregator: invalidAggregator"
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(
                getOldAggregator[_aggregatorVersion].aggregator
            ).submit(submissionId, _signatures);
            require(confirmed, "autoMintWithOldAggregator: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "autoMintWithOldAggregator: amount not confirmed"
                );
            }
        }
        _mint(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            _fallbackAddress,
            _executionFee,
            _data
        );
    }

    /// @dev Mints wrapped asset on the current chain.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: without applyed fee).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    function mint(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures
    ) external override {
        bytes32 submissionId = getSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(aggregator)
            .submit(submissionId, _signatures);
            require(confirmed, "mint: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "mint: amount not confirmed"
                );
            }
        }
        _mint(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            address(0),
            0,
            "0x"
        );
    }

    /// @dev Mints wrapped asset on the current chain.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: without applyed fee).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _aggregatorVersion Aggregator version.
    function mintWithOldAggregator(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        uint8 _aggregatorVersion
    ) external override {
        bytes32 submissionId = getSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce
        );
        AggregatorInfo memory aggregatorInfo = getOldAggregator[
            _aggregatorVersion
        ];
        require(
            aggregatorInfo.isValid,
            "mintWithOldAggregator: invalidAggregator"
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(
                aggregatorInfo.aggregator
            ).submit(submissionId, _signatures);
            require(confirmed, "mintWithOldAggregator: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "mintWithOldAggregator: amount not confirmed"
                );
            }
        }
        _mint(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            address(0),
            0,
            "0x"
        );
    }

    /// @dev Unlock the asset on the current chain and transfer to receiver.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: the fee can be applyed).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    function claim(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures
    ) external override {
        bytes32 submissionId = getSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(aggregator)
            .submit(submissionId, _signatures);
            require(confirmed, "claim: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "claim: amount not confirmed"
                );
            }
        }
        _claim(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            address(0),
            0,
            "0x"
        );
    }

    /// @dev Unlock the asset on the current chain and transfer to receiver.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: the fee can be applyed).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _fallbackAddress Receiver of the tokens if the call fails.
    /// @param _executionFee Fee paid to the transaction executor.
    /// @param _data Chain id of the target chain.
    function autoClaim(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        address _fallbackAddress,
        uint256 _executionFee,
        bytes memory _data
    ) external {
        bytes32 submissionId = getAutoSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce,
            _fallbackAddress,
            _executionFee,
            _data
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(aggregator)
            .submit(submissionId, _signatures);
            require(confirmed, "autoClaim: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "autoClaim: amount not confirmed"
                );
            }
        }
        _claim(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            _fallbackAddress,
            _executionFee,
            _data
        );
    }

    /// @dev Unlock the asset on the current chain and transfer to receiver.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: the fee can be applyed).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _fallbackAddress Receiver of the tokens if the call fails.
    /// @param _executionFee Fee paid to the transaction executor.
    /// @param _data Chain id of the target chain.
    function autoClaimWithOldAggregator(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        address _fallbackAddress,
        uint256 _executionFee,
        bytes memory _data,
        uint8 _aggregatorVersion
    ) external {
        bytes32 submissionId = getAutoSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce,
            _fallbackAddress,
            _executionFee,
            _data
        );
        require(
            getOldAggregator[_aggregatorVersion].isValid,
            "mintWithOldAggregator: invalid aggregator"
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(
                getOldAggregator[_aggregatorVersion].aggregator
            ).submit(submissionId, _signatures);
            require(confirmed, "mintWithOldAggregator: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "mintWithOldAggregator: amount not confirmed"
                );
            }
        }
        _claim(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            _fallbackAddress,
            _executionFee,
            _data
        );
    }

    /// @dev Unlock the asset on the current chain and transfer to receiver.
    /// @param _debridgeId Asset identifier.
    /// @param _receiver Receiver address.
    /// @param _amount Amount of the transfered asset (note: the fee can be applyed).
    /// @param _nonce Submission id.
    /// @param _signatures Array of oracles signatures.
    /// @param _aggregatorVersion Aggregator version.
    function claimWithOldAggregator(
        bytes32 _debridgeId,
        uint256 _chainIdFrom,
        address _receiver,
        uint256 _amount,
        uint256 _nonce,
        bytes[] calldata _signatures,
        uint8 _aggregatorVersion
    ) external override {
        bytes32 submissionId = getSubmisionId(
            _debridgeId,
            _chainIdFrom,
            chainId,
            _amount,
            _receiver,
            _nonce
        );
        require(
            getOldAggregator[_aggregatorVersion].isValid,
            "claimWithOldAggregator: invalid aggregator"
        );
        {
            (uint256 confirmations, bool confirmed) = ILightVerifier(
                getOldAggregator[_aggregatorVersion].aggregator
            ).submit(submissionId, _signatures);
            require(confirmed, "claimWithOldAggregator: not confirmed");
            if (_amount >= getAmountThreshold[_debridgeId]) {
                require(
                    confirmations >= excessConfirmations,
                    "claimWithOldAggregator: amount not confirmed"
                );
            }
        }
        _claim(
            submissionId,
            _debridgeId,
            _receiver,
            _amount,
            address(0),
            0,
            "0x"
        );
    }
}
