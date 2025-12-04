// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BookingEscrow
 * @dev Holds funds for bookings and releases them upon service completion.
 * Managed by a "Relayer" (Owner) to ensure a Web2-like experience.
 */
contract BookingEscrow {
    address public owner;

    enum Status { Pending, Completed, Refunded }

    struct Booking {
        uint256 amount;
        address provider;
        Status status;
    }

    // Mapping from Booking ID (database ID) to Booking Struct
    mapping(uint256 => Booking) public bookings;

    event BookingCreated(uint256 indexed bookingId, address indexed provider, uint256 amount);
    event FundsReleased(uint256 indexed bookingId, address indexed provider, uint256 amount);
    event FundsRefunded(uint256 indexed bookingId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a booking and deposit funds into escrow.
     * @param bookingId The unique ID from the database.
     * @param provider The wallet address of the service provider.
     */
    function createBooking(uint256 bookingId, address provider) external payable onlyOwner {
        require(bookings[bookingId].amount == 0, "Booking already exists");
        require(msg.value > 0, "Deposit must be > 0");
        require(provider != address(0), "Invalid provider address");

        bookings[bookingId] = Booking({
            amount: msg.value,
            provider: provider,
            status: Status.Pending
        });

        emit BookingCreated(bookingId, provider, msg.value);
    }

    /**
     * @dev Release funds to the service provider.
     * Called by the Relayer when the service is marked as "Completed" in the app.
     */
    function releaseFunds(uint256 bookingId) external onlyOwner {
        Booking storage booking = bookings[bookingId];
        require(booking.status == Status.Pending, "Booking not pending");
        require(booking.amount > 0, "No funds to release");

        booking.status = Status.Completed;
        
        (bool sent, ) = booking.provider.call{value: booking.amount}("");
        require(sent, "Failed to send Ether");

        emit FundsReleased(bookingId, booking.provider, booking.amount);
    }

    /**
     * @dev Refund funds back to the Relayer (Owner).
     * Called if the booking is cancelled.
     */
    function refund(uint256 bookingId) external onlyOwner {
        Booking storage booking = bookings[bookingId];
        require(booking.status == Status.Pending, "Booking not pending");

        booking.status = Status.Refunded;
        
        (bool sent, ) = owner.call{value: booking.amount}("");
        require(sent, "Failed to send Ether");

        emit FundsRefunded(bookingId, booking.amount);
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
