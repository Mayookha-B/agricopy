// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriEscrow {
    address public admin;

    enum OrderStatus { Pending, Paid, Delivered, Disputed, Refunded }

    struct Order {
        uint id;
        address payable buyer;
        address payable seller;
        uint amount;
        OrderStatus status;
    }

    mapping(uint => Order) public orders;
    uint public orderCount;

    event OrderPlaced(uint orderId, address buyer, address seller, uint amount);
    event PaymentReleased(uint orderId, address seller);

    constructor() {
        admin = msg.sender;
    }

    // Buyer pays into the contract
    function deposit(address payable _seller) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        orderCount++;
        orders[orderCount] = Order(orderCount, payable(msg.sender), _seller, msg.value, OrderStatus.Paid);
        
        emit OrderPlaced(orderCount, msg.sender, _seller, msg.value);
    }

    // Buyer confirms delivery and releases funds to Farmer
    function confirmDelivery(uint _orderId) external {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer, "Only buyer can confirm");
        require(order.status == OrderStatus.Paid, "Invalid status");

        order.status = OrderStatus.Delivered;
        order.seller.transfer(order.amount);

        emit PaymentReleased(_orderId, order.seller);
    }
}