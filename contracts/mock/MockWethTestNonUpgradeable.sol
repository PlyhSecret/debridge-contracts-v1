// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IWETH.sol";

contract MockWethTestNonUpgradeable
{
    using SafeERC20 for IERC20;

    mapping (address => uint) public balanceOf;

    IWETH public weth; // wrapped native token contract

    /* ========== EVENTS ========== */

    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    /* ========== CONSTRUCTOR  ========== */

    constructor(IWETH _weth) {
        weth = _weth;
    }

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        weth.deposit{value: msg.value}();
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
        weth.withdraw(wad);
        emit Withdrawal(msg.sender, wad);
    }

    // we need to accept ETH sends to unwrap WETH
    receive() external payable {
       // assert(msg.sender == address(weth)); // only accept ETH via fallback from the WETH contract
    }

    // ============ Version Control ============
    function version() external pure returns (uint256) {
        return 101; // 1.0.1
    }
}
