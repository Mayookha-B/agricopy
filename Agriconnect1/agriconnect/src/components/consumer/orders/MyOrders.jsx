import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyOrders.css";
import { ethers } from "ethers"; // Essential for MetaMask
import EscrowABI from "../../../contracts/EscrowABI.json";



const MyOrders = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      // Replace with your actual backend endpoint
      const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders", err);
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (order) => {

    // Check if the ID exists to prevent the 'walkAsync' error
    if (!order.blockchainOrderId) {
        alert("This order was placed before the blockchain ID system was implemented. It cannot be released via this button.");
        return;
    }

    try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const ESCROW_ABI = EscrowABI; // Ensure this path is correct
        const ESCROW_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Use your latest deployment address
        const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

       // 1. Change releaseFunds to confirmDelivery
        // 2. Use order.blockchainOrderId instead of order.transactionHash
        console.log("Releasing funds for Order ID:", order.blockchainOrderId);
        
        const contractId = BigInt(order.blockchainOrderId); 
        const tx = await escrowContract.confirmDelivery(contractId);

        console.log("Transaction pending...", tx.hash);
        await tx.wait();

        // 2. Update the Backend Status to 'Delivered'
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:5000/api/orders/complete/${order._id}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert("Funds released to farmer! Order completed.");
        fetchOrders(); // Refresh the list
    } catch (err) {
        console.error("Delivery confirmation failed:", err);
        alert("Transaction failed. Check MetaMask console.");
    }
};

  // Filter logic based on order status
  const currentOrders = orders.filter(o => o.status === "Active" || o.status === "Shipped" || o.status === "Pending");
  const pastOrders = orders.filter(o => o.status === "Delivered" || o.status === "Cancelled");

  const displayOrders = activeTab === "current" ? currentOrders : pastOrders;

  if (loading) return <div className="loader">Loading your orders...</div>;

  return (
    <div className="orders-container">
      <h1 className="orders-title">Your Orders</h1>

      {/* TABS */}
      <div className="orders-tabs">
        <button 
          className={activeTab === "current" ? "tab active" : "tab"} 
          onClick={() => setActiveTab("current")}
        >
          Current Orders ({currentOrders.length})
        </button>
        <button 
          className={activeTab === "past" ? "tab active" : "tab"} 
          onClick={() => setActiveTab("past")}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* ORDERS LIST */}
      <div className="orders-list">
        {displayOrders.length > 0 ? (
          displayOrders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <p className="label">ORDER PLACED</p>
                <p className="value">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="label">TOTAL</p>
                {/* Fix: Backend uses 'totalPrice' not 'totalAmount' */}
                <p className="value">₹{order.totalPrice}</p> 
              </div>
              <div>
                <p className="label">ORDER #</p>
                <p className="value">{order._id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="order-status-badge" data-status={order.status}>
                {order.status}
              </div>
            </div>

            <div className="order-body">
              {/* Fix: Backend sends single object, not an 'items' array. 
                  We use order.productId which was .populated in your backend */}
              <div className="order-item">
                <img 
                  src={order.productId?.image ? `http://localhost:5000/${order.productId.image.replace(/\\/g, "/")}` : "https://via.placeholder.com/80"} 
                  alt={order.productId?.cropName} 
                />
                <div className="item-details">
                  <h4>{order.productId?.cropName || "Product Name"}</h4>
                  <p>Quantity: {order.quantity}kg</p>
                  <p className="item-price">₹{order.totalPrice}</p>
                  {/* Added TxHash display for your DeFi demo */}
                  <p className="small text-muted">Tx: {order.transactionHash?.substring(0,10)}...</p>
                </div>
                {order.status === "Active" && (
                  <button 
                    className="confirm-delivery-btn" 
                    onClick={() => handleConfirmDelivery(order)}
                    style={{ backgroundColor: "#37c90b", color: "white", padding: "8px", borderRadius: "5px" }}
                  >
                  Confirm Delivery & Release Funds
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-orders">
          <i className="fas fa-box-open"></i>
          <p>No {activeTab} orders found.</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default MyOrders;