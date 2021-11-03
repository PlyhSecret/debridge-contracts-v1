// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../interfaces/IWETH.sol";

contract MockWethTest is Initializable, AccessControlUpgradeable
{
    using SafeERC20 for IERC20;

    mapping (address => uint) public balanceOf;

    IWETH public weth; // wrapped native token contract

    /* ========== EVENTS ========== */

    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    /* ========== ERRORS ========== */

    error AdminBadRole();

    /* ========== MODIFIERS ========== */

    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AdminBadRole();
        _;
    }

    /* ========== CONSTRUCTOR  ========== */

    function initialize(
        IWETH _weth
    ) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

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

    function setWeth(IWETH _weth) external onlyAdmin {
        weth = _weth;
    }

    // ============ Version Control ============
    function version() external pure returns (uint256) {
        return 101; // 1.0.1
    }
}
