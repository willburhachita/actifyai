// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ActifyToken
 * @dev ERC-20 test token for the Actify AI marketplace.
 *      New users can claim 1,000 tokens once via the faucet.
 *      Owner can also mint for testing purposes.
 */
contract ActifyToken is ERC20, Ownable {
    mapping(address => bool) public hasClaimed;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10 ** 18;

    constructor() ERC20("Actify Token", "ACT") Ownable(msg.sender) {}

    /// @notice Claim 1,000 free test tokens (once per address)
    function claimFaucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Owner can mint tokens for testing
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
