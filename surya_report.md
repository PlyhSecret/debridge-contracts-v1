## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/chainlink/Aggregator.sol | a56fef32808d83045a7fecc03eae513cd6182058 |
| contracts/chainlink/FullAggregator.sol | f47d87efe607ded908c6f3263315f76a980d59d1 |
| contracts/chainlink/LightAggregator.sol | 0cc6f824b52de88db28843bc5099396549442d17 |
| contracts/chainlink/LightVerifier.sol | 10cf23db407649cb56da7b06f186f811aa179e7b |
| contracts/interfaces/IAaveProtocolDataProvider.sol | 9b4980f4ea6ca4e500b7cd4da87988769a9c92de |
| contracts/interfaces/IAggregator.sol | b3f53a2fd3298d4f853062d530f77bf68e2a565d |
| contracts/interfaces/ICallProxy.sol | 864f02dfb8c4481f3295607e10fda1ae7cdab71f |
| contracts/interfaces/IDeBridgeGate.sol | b47c4f7fae09d6b188b0fb9eb3ddf32b0e455114 |
| contracts/interfaces/IDefiController.sol | 65e09a5b782a43d8170f348ca8ebaf10368eb7cf |
| contracts/interfaces/IERC677Receiver.sol | b8362773a96e3909b1fda864840da96ffbab3deb |
| contracts/interfaces/IFeeProxy.sol | f78080b02f0debc06d7094e05a9eddb5779c6225 |
| contracts/interfaces/IFullAggregator.sol | 2e0eb0762f18269df44152436f90d3737433135e |
| contracts/interfaces/ILendingPool.sol | 7f741d720cf3e5d8936eb54cb5dcd6b5c664c54f |
| contracts/interfaces/ILendingPoolAddressesProvider.sol | 450d137a98cae3fb31ebb4f25f268467ef60be06 |
| contracts/interfaces/ILightAggregator.sol | 8a1c0848ce3ed2acb70cb31e0d3b79d3818c9349 |
| contracts/interfaces/ILightVerifier.sol | b9665e0bb42e5620e5004152b5660aa1fef239cf |
| contracts/interfaces/ILinkToken.sol | 48aac2e9d446e96a896df953f38f1f7c4d747c2c |
| contracts/interfaces/IPriceConsumer.sol | a4e494253d3879367fed52286fddb5f8941b517f |
| contracts/interfaces/IStrategy.sol | 1b81c14a9e3ea079bacf7fbfbfe8b6fb97c2ff2a |
| contracts/interfaces/IUniswapV2Callee.sol | 9786e081ec8ca9093f034523be3f080be0f19d8a |
| contracts/interfaces/IUniswapV2ERC20.sol | 72f922b597ac06c648fb8f2908248fdb93123d3b |
| contracts/interfaces/IUniswapV2Factory.sol | cf0920d75951f1877d996033a67d8e38bcc38939 |
| contracts/interfaces/IUniswapV2Pair.sol | 74c8dbc1ee735532237f4c163643ce2a511a4d64 |
| contracts/interfaces/IWETH.sol | 476a3c1a9e3985a282323f78fa9f26a46d41cb6c |
| contracts/interfaces/IWrappedAsset.sol | a0794c1c0fafe4cc50e5d48e27268b54b253d4bb |
| contracts/oracles/DelegatedStaking.sol | 561d7fcebf7b4a01b236ea38446d424eef92f2dd |
| contracts/periphery/AaveController.sol | 043fb30cbdd632d8e97c87d8d81e8bd57f402191 |
| contracts/periphery/CallProxy.sol | f613355d3ff395f7497859109b76b7cfddd585e2 |
| contracts/periphery/DefiController.sol | 11ee83a9061a6d1845fb78c20b9a90c839965b41 |
| contracts/periphery/FeeProxy.sol | 0d4de0d81eeb5da0faf0b23f6705c7ec6d817da8 |
| contracts/periphery/Pausable.sol | 473125269691a915b2f50d7c98a9afb1c84f4cd7 |
| contracts/periphery/PriceConsumer.sol | a56776e317359a4465b466f0b4ae35a67e858678 |
| contracts/periphery/WrappedAsset.sol | 5fd6509babc8639a45c82e9ee78e5c18c3822620 |
| contracts/transfers/DeBridgeGate.sol | aafac378b5d94142f445b7c45dc76837e32dca62 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **Aggregator** | Implementation | AccessControl, IAggregator |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | updateOracleAdmin | External ❗️ | 🛑  |NO❗️ |
| └ | setMinConfirmations | Public ❗️ | 🛑  | onlyAdmin |
| └ | addOracle | External ❗️ | 🛑  | onlyAdmin |
| └ | removeOracle | External ❗️ | 🛑  | onlyAdmin |
| └ | getDeployId | Public ❗️ |   |NO❗️ |
| └ | getDebridgeId | Public ❗️ |   |NO❗️ |
||||||
| **FullAggregator** | Implementation | Aggregator, IFullAggregator |||
| └ | <Constructor> | Public ❗️ | 🛑  | Aggregator |
| └ | submitMany | External ❗️ | 🛑  | onlyOracle |
| └ | confirmNewAsset | External ❗️ | 🛑  | onlyOracle |
| └ | submit | External ❗️ | 🛑  | onlyOracle |
| └ | _submit | Internal 🔒 | 🛑  | |
| └ | deployAsset | External ❗️ | 🛑  |NO❗️ |
| └ | setExcessConfirmations | Public ❗️ | 🛑  | onlyAdmin |
| └ | setThreshold | Public ❗️ | 🛑  | onlyAdmin |
| └ | setWrappedAssetAdmin | Public ❗️ | 🛑  | onlyAdmin |
| └ | setDebridgeAddress | Public ❗️ | 🛑  | onlyAdmin |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
||||||
| **LightAggregator** | Implementation | Aggregator, ILightAggregator |||
| └ | <Constructor> | Public ❗️ | 🛑  | Aggregator |
| └ | confirmNewAsset | External ❗️ | 🛑  | onlyOracle |
| └ | submitMany | External ❗️ | 🛑  | onlyOracle |
| └ | submit | External ❗️ | 🛑  | onlyOracle |
| └ | _submit | Internal 🔒 | 🛑  | |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
| └ | getSubmissionSignatures | External ❗️ |   |NO❗️ |
| └ | getUnsignedMsg | Public ❗️ |   |NO❗️ |
| └ | splitSignature | Public ❗️ |   |NO❗️ |
||||||
| **LightVerifier** | Implementation | AccessControl, ILightVerifier |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | confirmNewAsset | External ❗️ | 🛑  |NO❗️ |
| └ | submit | External ❗️ | 🛑  |NO❗️ |
| └ | deployAsset | External ❗️ | 🛑  |NO❗️ |
| └ | setWrappedAssetAdmin | Public ❗️ | 🛑  | onlyAdmin |
| └ | setDebridgeAddress | Public ❗️ | 🛑  | onlyAdmin |
| └ | setMinConfirmations | External ❗️ | 🛑  | onlyAdmin |
| └ | addOracle | External ❗️ | 🛑  | onlyAdmin |
| └ | removeOracle | External ❗️ | 🛑  | onlyAdmin |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
| └ | getUnsignedMsg | Public ❗️ |   |NO❗️ |
| └ | splitSignature | Public ❗️ |   |NO❗️ |
| └ | getDebridgeId | Public ❗️ |   |NO❗️ |
| └ | getDeployId | Public ❗️ |   |NO❗️ |
||||||
| **IAaveProtocolDataProvider** | Interface |  |||
| └ | getReserveTokensAddresses | External ❗️ |   |NO❗️ |
||||||
| **IAggregator** | Interface |  |||
||||||
| **ICallProxy** | Interface |  |||
| └ | call | External ❗️ |  💵 |NO❗️ |
| └ | callERC20 | External ❗️ | 🛑  |NO❗️ |
||||||
| **IDeBridgeGate** | Interface |  |||
| └ | send | External ❗️ |  💵 |NO❗️ |
| └ | mint | External ❗️ | 🛑  |NO❗️ |
| └ | burn | External ❗️ |  💵 |NO❗️ |
| └ | claim | External ❗️ | 🛑  |NO❗️ |
| └ | autoSend | External ❗️ |  💵 |NO❗️ |
| └ | autoMint | External ❗️ | 🛑  |NO❗️ |
| └ | autoBurn | External ❗️ |  💵 |NO❗️ |
| └ | autoClaim | External ❗️ | 🛑  |NO❗️ |
| └ | mintWithOldAggregator | External ❗️ | 🛑  |NO❗️ |
| └ | claimWithOldAggregator | External ❗️ | 🛑  |NO❗️ |
| └ | autoMintWithOldAggregator | External ❗️ | 🛑  |NO❗️ |
| └ | autoClaimWithOldAggregator | External ❗️ | 🛑  |NO❗️ |
||||||
| **IDefiController** | Interface |  |||
| └ | claimReserve | External ❗️ | 🛑  |NO❗️ |
||||||
| **IERC677Receiver** | Interface | IERC20 |||
| └ | onTokenTransfer | External ❗️ | 🛑  |NO❗️ |
||||||
| **IFeeProxy** | Interface |  |||
| └ | swapToLink | External ❗️ | 🛑  |NO❗️ |
||||||
| **IFullAggregator** | Interface |  |||
| └ | submit | External ❗️ | 🛑  |NO❗️ |
| └ | submitMany | External ❗️ | 🛑  |NO❗️ |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
| └ | getWrappedAssetAddress | External ❗️ |   |NO❗️ |
| └ | deployAsset | External ❗️ | 🛑  |NO❗️ |
||||||
| **ILendingPool** | Interface |  |||
| └ | deposit | External ❗️ | 🛑  |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
||||||
| **ILendingPoolAddressesProvider** | Interface |  |||
| └ | getLendingPool | External ❗️ |   |NO❗️ |
||||||
| **ILightAggregator** | Interface |  |||
| └ | submitMany | External ❗️ | 🛑  |NO❗️ |
| └ | submit | External ❗️ | 🛑  |NO❗️ |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
||||||
| **ILightVerifier** | Interface |  |||
| └ | submit | External ❗️ | 🛑  |NO❗️ |
| └ | getSubmissionConfirmations | External ❗️ |   |NO❗️ |
| └ | getWrappedAssetAddress | External ❗️ |   |NO❗️ |
| └ | deployAsset | External ❗️ | 🛑  |NO❗️ |
||||||
| **ILinkToken** | Interface | IERC20 |||
| └ | transferAndCall | External ❗️ | 🛑  |NO❗️ |
||||||
| **IPriceConsumer** | Interface |  |||
| └ | getPriceOfToken | External ❗️ |   |NO❗️ |
||||||
| **IStrategy** | Interface |  |||
| └ | deposit | External ❗️ | 🛑  |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawAll | External ❗️ | 🛑  |NO❗️ |
| └ | updateReserves | External ❗️ |   |NO❗️ |
||||||
| **IUniswapV2Callee** | Interface |  |||
| └ | uniswapV2Call | External ❗️ | 🛑  |NO❗️ |
||||||
| **IUniswapV2ERC20** | Interface |  |||
| └ | name | External ❗️ |   |NO❗️ |
| └ | symbol | External ❗️ |   |NO❗️ |
| └ | decimals | External ❗️ |   |NO❗️ |
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
| └ | DOMAIN_SEPARATOR | External ❗️ |   |NO❗️ |
| └ | PERMIT_TYPEHASH | External ❗️ |   |NO❗️ |
| └ | nonces | External ❗️ |   |NO❗️ |
| └ | permit | External ❗️ | 🛑  |NO❗️ |
||||||
| **IUniswapV2Factory** | Interface |  |||
| └ | feeTo | External ❗️ |   |NO❗️ |
| └ | feeToSetter | External ❗️ |   |NO❗️ |
| └ | getPair | External ❗️ |   |NO❗️ |
| └ | allPairs | External ❗️ |   |NO❗️ |
| └ | allPairsLength | External ❗️ |   |NO❗️ |
| └ | createPair | External ❗️ | 🛑  |NO❗️ |
| └ | setFeeTo | External ❗️ | 🛑  |NO❗️ |
| └ | setFeeToSetter | External ❗️ | 🛑  |NO❗️ |
||||||
| **IUniswapV2Pair** | Interface |  |||
| └ | name | External ❗️ |   |NO❗️ |
| └ | symbol | External ❗️ |   |NO❗️ |
| └ | decimals | External ❗️ |   |NO❗️ |
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
| └ | DOMAIN_SEPARATOR | External ❗️ |   |NO❗️ |
| └ | PERMIT_TYPEHASH | External ❗️ |   |NO❗️ |
| └ | nonces | External ❗️ |   |NO❗️ |
| └ | permit | External ❗️ | 🛑  |NO❗️ |
| └ | MINIMUM_LIQUIDITY | External ❗️ |   |NO❗️ |
| └ | factory | External ❗️ |   |NO❗️ |
| └ | token0 | External ❗️ |   |NO❗️ |
| └ | token1 | External ❗️ |   |NO❗️ |
| └ | getReserves | External ❗️ |   |NO❗️ |
| └ | price0CumulativeLast | External ❗️ |   |NO❗️ |
| └ | price1CumulativeLast | External ❗️ |   |NO❗️ |
| └ | kLast | External ❗️ |   |NO❗️ |
| └ | mint | External ❗️ | 🛑  |NO❗️ |
| └ | burn | External ❗️ | 🛑  |NO❗️ |
| └ | swap | External ❗️ | 🛑  |NO❗️ |
| └ | skim | External ❗️ | 🛑  |NO❗️ |
| └ | sync | External ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  |NO❗️ |
||||||
| **IWETH** | Interface |  |||
| └ | deposit | External ❗️ |  💵 |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
||||||
| **IWrappedAsset** | Interface | IERC20 |||
| └ | mint | External ❗️ | 🛑  |NO❗️ |
| └ | burn | External ❗️ | 🛑  |NO❗️ |
| └ | permit | External ❗️ | 🛑  |NO❗️ |
||||||
| **DelegatedStaking** | Implementation | AccessControl, Initializable |||
| └ | initialize | Public ❗️ | 🛑  | initializer |
| └ | stake | External ❗️ | 🛑  |NO❗️ |
| └ | requestUnstake | External ❗️ | 🛑  |NO❗️ |
| └ | executeUnstake | External ❗️ | 🛑  |NO❗️ |
| └ | requestTransfer | External ❗️ | 🛑  |NO❗️ |
| └ | executeTransfer | External ❗️ | 🛑  |NO❗️ |
| └ | getPricePerFullShare | External ❗️ |   |NO❗️ |
| └ | getPricePerFullOracleShare | External ❗️ |   |NO❗️ |
| └ | getPoolUSDAmount | Internal 🔒 |   | |
| └ | getTotalUSDAmount | Internal 🔒 |   | |
| └ | depositToStrategy | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawFromStrategy | External ❗️ | 🛑  |NO❗️ |
| └ | emergencyWithdrawFromStrategy | External ❗️ | 🛑  | onlyAdmin |
| └ | recoverFromEmergency | External ❗️ | 🛑  |NO❗️ |
| └ | setProfitSharing | External ❗️ | 🛑  |NO❗️ |
| └ | setTimelock | External ❗️ | 🛑  | onlyAdmin |
| └ | setTimelockForTransfer | External ❗️ | 🛑  | onlyAdmin |
| └ | addOracle | External ❗️ | 🛑  | onlyAdmin |
| └ | addCollateral | External ❗️ | 🛑  | onlyAdmin |
| └ | addStrategy | External ❗️ | 🛑  | onlyAdmin |
| └ | updateCollateral | External ❗️ | 🛑  | onlyAdmin |
| └ | updateCollateral | External ❗️ | 🛑  | onlyAdmin |
| └ | updateStrategy | External ❗️ | 🛑  | onlyAdmin |
| └ | cancelUnstake | External ❗️ | 🛑  |NO❗️ |
| └ | liquidate | External ❗️ | 🛑  | onlyAdmin |
| └ | withdrawFunds | External ❗️ | 🛑  | onlyAdmin |
| └ | pauseUnstake | External ❗️ | 🛑  | onlyAdmin |
| └ | resumeUnstake | External ❗️ | 🛑  | onlyAdmin |
| └ | setPriceConsumer | External ❗️ | 🛑  | onlyAdmin |
| └ | distributeRewards | External ❗️ | 🛑  |NO❗️ |
| └ | getWithdrawalRequest | Public ❗️ |   |NO❗️ |
| └ | getTransferRequest | Public ❗️ |   |NO❗️ |
| └ | getOracleStaking | Public ❗️ |   |NO❗️ |
| └ | getDelegatorStakes | Public ❗️ |   |NO❗️ |
| └ | getDelegatorShares | Public ❗️ |   |NO❗️ |
| └ | getTotalDelegation | Public ❗️ |   |NO❗️ |
| └ | min | Internal 🔒 |   | |
||||||
| **AaveInteractor** | Implementation | IStrategy |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | lendingPool | Public ❗️ |   |NO❗️ |
| └ | aToken | Public ❗️ |   |NO❗️ |
| └ | updateReserves | External ❗️ |   |NO❗️ |
| └ | deposit | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawAll | External ❗️ | 🛑  |NO❗️ |
| └ | withdraw | Public ❗️ | 🛑  |NO❗️ |
||||||
| **CallProxy** | Implementation | ICallProxy |||
| └ | call | External ❗️ |  💵 |NO❗️ |
| └ | callERC20 | External ❗️ | 🛑  |NO❗️ |
| └ | externalCall | Internal 🔒 | 🛑  | |
||||||
| **DefiController** | Implementation | AccessControl |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
||||||
| **FeeProxy** | Implementation | IFeeProxy |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | getAmountOut | Internal 🔒 |   | |
| └ | swapToLink | External ❗️ | 🛑  |NO❗️ |
||||||
| **Pausable** | Implementation |  |||
| └ | paused | Public ❗️ |   |NO❗️ |
| └ | _pause | Internal 🔒 | 🛑  | whenNotPaused |
| └ | _unpause | Internal 🔒 | 🛑  | whenPaused |
||||||
| **PriceConsumer** | Implementation | IPriceConsumer, Ownable |||
| └ | getPriceOfToken | External ❗️ |   |NO❗️ |
| └ | addPriceFeed | External ❗️ | 🛑  | onlyOwner |
||||||
| **WrappedAsset** | Implementation | AccessControl, IWrappedAsset, ERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC20 |
| └ | mint | External ❗️ | 🛑  | onlyMinter |
| └ | burn | External ❗️ | 🛑  | onlyMinter |
| └ | permit | External ❗️ | 🛑  |NO❗️ |
| └ | decimals | Public ❗️ |   |NO❗️ |
||||||
| **DeBridgeGate** | Implementation | AccessControl, Initializable, Pausable, IDeBridgeGate |||
| └ | initialize | Public ❗️ |  💵 | initializer |
| └ | send | External ❗️ |  💵 | whenNotPaused |
| └ | mint | External ❗️ | 🛑  | whenNotPaused |
| └ | burn | External ❗️ |  💵 | whenNotPaused |
| └ | claim | External ❗️ | 🛑  | whenNotPaused |
| └ | autoSend | External ❗️ |  💵 | whenNotPaused |
| └ | autoMint | External ❗️ | 🛑  | whenNotPaused |
| └ | autoBurn | External ❗️ |  💵 | whenNotPaused |
| └ | autoClaim | External ❗️ | 🛑  | whenNotPaused |
| └ | mintWithOldAggregator | External ❗️ | 🛑  | whenNotPaused |
| └ | claimWithOldAggregator | External ❗️ | 🛑  | whenNotPaused |
| └ | autoMintWithOldAggregator | External ❗️ | 🛑  | whenNotPaused |
| └ | autoClaimWithOldAggregator | External ❗️ | 🛑  | whenNotPaused |
| └ | updateChainSupport | External ❗️ | 🛑  | onlyAdmin |
| └ | updateAssetFixedFees | External ❗️ | 🛑  | onlyAdmin |
| └ | updateExcessConfirmations | External ❗️ | 🛑  | onlyAdmin |
| └ | setChainIdSupport | External ❗️ | 🛑  | onlyAdmin |
| └ | setCallProxy | External ❗️ | 🛑  | onlyAdmin |
| └ | updateAsset | External ❗️ | 🛑  | onlyAdmin |
| └ | setAggregator | External ❗️ | 🛑  | onlyAdmin |
| └ | manageOldAggregator | External ❗️ | 🛑  | onlyAdmin |
| └ | setDefiController | External ❗️ | 🛑  | onlyAdmin |
| └ | pause | External ❗️ | 🛑  | onlyAdmin whenNotPaused |
| └ | unpause | External ❗️ | 🛑  | onlyAdmin whenPaused |
| └ | withdrawFee | External ❗️ | 🛑  | onlyAdmin |
| └ | withdrawNativeFee | External ❗️ | 🛑  | onlyAdmin |
| └ | requestReserves | External ❗️ | 🛑  | onlyDefiController |
| └ | returnReserves | External ❗️ |  💵 | onlyDefiController |
| └ | fundTreasury | External ❗️ | 🛑  |NO❗️ |
| └ | setFeeProxy | External ❗️ | 🛑  | onlyAdmin |
| └ | setWeth | External ❗️ | 🛑  | onlyAdmin |
| └ | blockSubmission | External ❗️ | 🛑  | onlyAdmin |
| └ | unBlockSubmission | External ❗️ | 🛑  | onlyAdmin |
| └ | _checkAndDeployAsset | Internal 🔒 | 🛑  | |
| └ | _checkConfirmations | Internal 🔒 | 🛑  | |
| └ | _checkConfirmationsOldAggregator | Internal 🔒 | 🛑  | |
| └ | _addAsset | Internal 🔒 | 🛑  | |
| └ | _ensureReserves | Internal 🔒 | 🛑  | |
| └ | _send | Internal 🔒 | 🛑  | |
| └ | _burn | Internal 🔒 | 🛑  | |
| └ | _mint | Internal 🔒 | 🛑  | |
| └ | _claim | Internal 🔒 | 🛑  | |
| └ | splitSignature | Public ❗️ |   |NO❗️ |
| └ | getBalance | Public ❗️ |   |NO❗️ |
| └ | getDebridgeId | Public ❗️ |   |NO❗️ |
| └ | getSubmisionId | Public ❗️ |   |NO❗️ |
| └ | getAutoSubmisionId | Public ❗️ |   |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
