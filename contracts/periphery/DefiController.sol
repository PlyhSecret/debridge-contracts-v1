// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "../interfaces/IDefiController.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/IDebridge.sol";

contract DefiController is IDefiController, AccessControl {
    struct NewAssetInfo {
        address asset;
        bool active;
        uint256 rate;
    }

    struct StrategyInfo {
        bool active;
        uint256 borrowed;
        uint256 delta;
        uint256 rate;
    }

    struct AssetInfo {
        bool active;
        uint256 borrowed;
        mapping(address => StrategyInfo) strategies;
    }

    mapping(address => AssetInfo) public getAssetInfo; // asset => asset info
    mapping(address => uint256) public getStrategyId; // asset => asset info
    address[] public assets;
    address[] public strategies;
    uint256 public constant accuracy = 1e18;
    address public debridge;

    modifier onlyAdmin {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "onlyAdmin: bad role");
        _;
    }

    constructor() {}

    function claimReserve(address _tokenAddress, uint256 _amount)
        external
        override
    {}

    function addStrategy(address _strategy) external onlyAdmin() {
        require(
            getStrategyId[_strategy] == 0,
            "DefiController: strategy exists"
        );
        getStrategyId[_strategy] = strategies.length + 1;
        strategies.push(_strategy);
    }

    function removeStrategy(address _strategy) external onlyAdmin() {
        uint256 strategyId = getStrategyId[_strategy];
        require(strategyId != 0, "DefiController: strategy exists");
        // Return assets
        if (strategies.length > 1) {
            getStrategyId[strategies[strategies.length - 1]] = strategyId;
            strategies[strategyId] = strategies[strategies.length - 1];
        }
        strategies.pop();
    }

    function rebalanceAsset(address _asset) external {
        require(
            getAssetInfo[_asset].active,
            "DefiController: asset not supported"
        );
        uint256 balance = IERC20(_asset).balanceOf(debridge);
        for (uint256 i = 0; i < strategies.length; i++) {
            address strategy = strategies[i];
            StrategyInfo memory strategyInfo = getAssetInfo[_asset].strategies[
                strategy
            ];
            if (strategyInfo.active) {
                if (
                    strategyInfo.borrowed * accuracy >
                    balance * (strategyInfo.rate + strategyInfo.delta)
                ) {
                    uint256 excessAmount = (strategyInfo.borrowed *
                        accuracy -
                        strategyInfo.rate *
                        balance) / accuracy;
                    IStrategy(strategy).withdraw(
                        _asset,
                        excessAmount,
                        debridge
                    );
                    strategyInfo.borrowed -= excessAmount;
                    getAssetInfo[_asset].borrowed -= excessAmount;
                }
                if (
                    strategyInfo.borrowed * accuracy <
                    balance * (strategyInfo.rate - strategyInfo.delta)
                ) {
                    uint256 requiredAmount = (strategyInfo.rate *
                        balance -
                        strategyInfo.borrowed *
                        accuracy) / accuracy;
                    IDebridge(debridge).requestReserves(
                        _asset,
                        requiredAmount,
                        strategy
                    );
                    IStrategy(strategy).deposit(_asset);
                    strategyInfo.borrowed += requiredAmount;
                    getAssetInfo[_asset].borrowed += requiredAmount;
                }
            }
        }
    }

    function removeAsset(address _asset) external {
        require(
            getAssetInfo[_asset].active,
            "DefiController: asset not supported"
        );
        for (uint256 i = 0; i < strategies.length; i++) {
            address strategy = strategies[i];
            StrategyInfo memory strategyInfo = getAssetInfo[_asset].strategies[
                strategy
            ];
            if (strategyInfo.active) {
                IStrategy(strategy).withdraw(
                    _asset,
                    strategyInfo.borrowed,
                    debridge
                );
                getAssetInfo[_asset].borrowed -= strategyInfo.borrowed;
            }
        }
        getAssetInfo[_asset].active = false;
    }
    // function manageAssets(address[] memory _assets) external {
    //     assets = _assets;
    //     for (uint256 i = 0; i < _assets.length; i++) {
    //         assetsInfo[_assets[i]].active = true;
    //     }
    // }
}
