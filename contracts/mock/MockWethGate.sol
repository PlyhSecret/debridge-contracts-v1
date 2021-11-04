// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../interfaces/IWETH.sol";

contract MockWethGate
{
    using SafeERC20 for IERC20;

    mapping (address => uint) public balanceOf;

    IWETH public weth; // wrapped native token contract

    /* ========== ERRORS ========== */

    error EthTransferFailed();

    /* ========== EVENTS ========== */

    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    /* ========== CONSTRUCTOR  ========== */

    constructor(IWETH _weth) {
        weth = _weth;
    }

    function withdraw(address receiver, uint wad) public {
        weth.withdraw(wad);
        _safeTransferETH(receiver, wad);
        emit Withdrawal(msg.sender, wad);
    }

    function _safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        if (!success) revert EthTransferFailed();
    }

    // we need to accept ETH sends to unwrap WETH
    receive() external payable {
    }

    // ============ Version Control ============
    function version() external pure returns (uint256) {
        return 101; // 1.0.1
    }
}
