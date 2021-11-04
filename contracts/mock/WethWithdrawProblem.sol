// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../interfaces/IWETH.sol";

contract WethWithdrawProblem is Initializable, AccessControlUpgradeable
{

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

    /* ========== METHODS ========== */

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

    // we need to accept ETH sends to unwrap WETH
    receive() external payable {
    }

    // ============ Version Control ============
    function version() external pure returns (uint256) {
        return 101; // 1.0.1
    }
}
