// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ActifyEscrow
 * @dev Escrow contract for the Actify AI marketplace.
 *      Locks ERC-20 tokens when a purchase is made.
 *      Buyer confirms receipt to release funds to treasury.
 *      Buyer can also request a refund if goods not received.
 */
contract ActifyEscrow is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public treasury;

    enum EscrowStatus { None, Locked, Released, Refunded }

    struct Escrow {
        address buyer;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
    }

    // orderId (bytes32) => Escrow
    mapping(bytes32 => Escrow) public escrows;

    event TokensLocked(bytes32 indexed orderId, address indexed buyer, uint256 amount);
    event TokensReleased(bytes32 indexed orderId, address indexed buyer, uint256 amount);
    event TokensRefunded(bytes32 indexed orderId, address indexed buyer, uint256 amount);

    constructor(address _token, address _treasury) Ownable(msg.sender) {
        token = IERC20(_token);
        treasury = _treasury;
    }

    /// @notice Lock tokens in escrow for a purchase
    /// @param orderId Unique identifier for the order (generated off-chain)
    /// @param amount Amount of tokens to lock
    function lockTokens(bytes32 orderId, uint256 amount) external {
        require(escrows[orderId].status == EscrowStatus.None, "Order already exists");
        require(amount > 0, "Amount must be > 0");

        token.safeTransferFrom(msg.sender, address(this), amount);

        escrows[orderId] = Escrow({
            buyer: msg.sender,
            amount: amount,
            status: EscrowStatus.Locked,
            createdAt: block.timestamp
        });

        emit TokensLocked(orderId, msg.sender, amount);
    }

    /// @notice Buyer confirms receipt — releases tokens to treasury
    /// @param orderId The order to release
    function releaseTokens(bytes32 orderId) external {
        Escrow storage escrow = escrows[orderId];
        require(escrow.status == EscrowStatus.Locked, "Not in locked state");
        require(escrow.buyer == msg.sender, "Only buyer can release");

        escrow.status = EscrowStatus.Released;
        token.safeTransfer(treasury, escrow.amount);

        emit TokensReleased(orderId, msg.sender, escrow.amount);
    }

    /// @notice Refund tokens back to the buyer
    /// @param orderId The order to refund
    function refundTokens(bytes32 orderId) external {
        Escrow storage escrow = escrows[orderId];
        require(escrow.status == EscrowStatus.Locked, "Not in locked state");
        require(
            escrow.buyer == msg.sender || msg.sender == owner(),
            "Only buyer or owner can refund"
        );

        escrow.status = EscrowStatus.Refunded;
        token.safeTransfer(escrow.buyer, escrow.amount);

        emit TokensRefunded(orderId, escrow.buyer, escrow.amount);
    }

    /// @notice View escrow details
    function getEscrow(bytes32 orderId) external view returns (Escrow memory) {
        return escrows[orderId];
    }

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
