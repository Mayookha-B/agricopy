import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MDBIcon } from 'mdb-react-ui-kit';
import { ethers } from "ethers";
import { useCart } from "../../../context/CartContext";
import "./Checkout.css";
import EscrowABI from "../../../contracts/EscrowABI.json";

// Smart Contract Configuration
const ESCROW_ABI = EscrowABI;
const ESCROW_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Extract data passed from Shop or Forecast
  const { product, qty, totalAmountETH, totalAmountINR, cartItems } = location.state || {};
  
  const [processing, setProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("traditional"); // 'traditional' or 'wallet'

  useEffect(() => {
    if (!product && !cartItems) {
      navigate("/shop");
    }
    checkWalletConnection();
  }, [product, cartItems, navigate]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) setWalletAddress(accounts[0]);
    }
  };

  // --- PATH 1: BLOCKCHAIN (METAMASK) ---
  const handleBlockchainPayment = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed.");
      return null;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

      const sellerWallet = cartItems 
        ? "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" 
        : (product.farmerWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

      const ethValue = totalAmountETH ? Number(totalAmountETH).toFixed(18) : "0";

      const tx = await escrowContract.deposit(sellerWallet, {
        value: ethers.parseEther(ethValue),
        gasLimit: 150000,
      });

      console.log("Mining transaction...", tx.hash);
      const receipt = await tx.wait();

      // Parse logs for Order ID
      const orderPlacedLog = receipt.logs
        .map(log => {
          try { return escrowContract.interface.parseLog(log); } 
          catch (e) { return null; }
        })
        .find(event => event && event.name === "OrderPlaced");

      const blockchainOrderId = orderPlacedLog 
        ? (orderPlacedLog.args.orderId || orderPlacedLog.args[0]).toString() 
        : Date.now().toString();

      return { hash: tx.hash, id: blockchainOrderId };
    } catch (err) {
      console.error("Blockchain Error:", err);
      alert("MetaMask payment failed.");
      return null;
    }
  };

  // --- PATH 2: TRADITIONAL (RAZORPAY + RELAYER BRIDGE) ---
  const handleTraditionalPayment = async () => {
    try {
      // 1. Create Razorpay Order on Backend
      const { data } = await axios.post("http://localhost:5000/api/orders/create-razorpay", { 
        amount: totalAmountINR 
      });

      return new Promise((resolve) => {
        const options = {
          key: "YOUR_RAZORPAY_TEST_KEY", // Replace with your key from Razorpay Dashboard
          amount: data.amount,
          currency: "INR",
          name: "AgriConnect Escrow",
          description: `Payment for ${product?.cropName || 'Cart Items'}`,
          handler: async (response) => {
            // 2. Trigger Backend Relayer to execute Smart Contract transaction
            const bridgeRes = await axios.post("http://localhost:5000/api/payment/bridge-to-blockchain", {
              paymentId: response.razorpay_payment_id,
              totalINR: totalAmountINR,
              sellerWallet: product?.farmerWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            });
            resolve({ hash: bridgeRes.data.txHash, id: bridgeRes.data.blockchainOrderId });
          },
          theme: { color: "#198754" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err) {
      console.error("Traditional Payment Error:", err);
      return null;
    }
  };

  const processOrder = async () => {
    setProcessing(true);
    
    // Choose payment logic based on state
    const result = paymentMethod === "wallet" 
      ? await handleBlockchainPayment() 
      : await handleTraditionalPayment();

    if (!result) {
      setProcessing(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const ordersToPlace = cartItems 
        ? cartItems.map(item => ({
            productId: item._id,
            farmerId: item.farmerId._id || item.farmerId,
            quantity: item.qty,
            totalPrice: (item.priceInINR * item.qty),
            transactionHash: result.hash,
            blockchainOrderId: result.id,
            paymentType: paymentMethod,
            status: "Active"
          }))
        : [{
            productId: product._id,
            farmerId: product.farmerId._id || product.farmerId,
            quantity: qty,
            totalPrice: totalAmountINR,
            transactionHash: result.hash,
            blockchainOrderId: result.id,
            paymentType: paymentMethod,
            status: "Active"
          }];

      for (const order of ordersToPlace) {
        await axios.post("http://localhost:5000/api/orders/place", order, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (cartItems) clearCart();
      alert("Order successfully protected by Smart Contract!");
      navigate("/my-orders");
    } catch (err) {
      alert("Recording failed. TxHash: " + result.hash);
    } finally {
      setProcessing(false);
    }
  };

  if (!product && !cartItems) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-card shadow-lg">
        <h2 className="checkout-title"><MDBIcon fas icon="shield-alt" className="me-2" /> Secure Checkout</h2>

        {/* Item Summary */}
        <div className="checkout-items-preview">
          {cartItems ? cartItems.map(item => (
            <div key={item._id} className="checkout-row">
              <span>{item.cropName} (x{item.qty}kg)</span>
              <strong>₹{item.priceInINR * item.qty}</strong>
            </div>
          )) : (
            <div className="checkout-row">
              <span>{product.cropName} (x{qty}kg)</span>
              <strong>₹{totalAmountINR}</strong>
            </div>
          )}
        </div>

        {/* Payment Selector */}
        <div className="payment-method-selector my-4">
          <h6 className="text-muted small fw-bold mb-3">SELECT PAYMENT MODE:</h6>
          
          <div className={`method-option ${paymentMethod === 'traditional' ? 'selected' : ''}`} 
               onClick={() => setPaymentMethod('traditional')}>
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="credit-card" className="me-3 text-primary fs-4" />
              <div>
                <strong className="d-block">Traditional Pay</strong>
                <span className="small text-muted">UPI, Card (Bridged to Blockchain)</span>
              </div>
              {paymentMethod === 'traditional' && <MDBIcon fas icon="check-circle" className="ms-auto text-success" />}
            </div>
          </div>

          <div className={`method-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} 
               onClick={() => setPaymentMethod('wallet')}>
            <div className="d-flex align-items-center">
              <MDBIcon fab icon="ethereum" className="me-3 text-warning fs-4" />
              <div>
                <strong className="d-block">Web3 Wallet</strong>
                <span className="small text-muted">Direct ETH via MetaMask</span>
              </div>
              {paymentMethod === 'wallet' && <MDBIcon fas icon="check-circle" className="ms-auto text-success" />}
            </div>
          </div>
        </div>

        <div className="checkout-billing p-3 bg-light rounded mb-4">
          <div className="billing-item d-flex justify-content-between">
            <span>Total Amount:</span>
            <strong>{paymentMethod === 'wallet' ? `${totalAmountETH} ETH` : `₹${totalAmountINR}`}</strong>
          </div>
        </div>

        <button className="confirm-btn w-100 mb-2" onClick={processOrder} disabled={processing}>
          {processing ? <><MDBIcon fas icon="spinner" spin /> Processing...</> : `Confirm & Pay via ${paymentMethod === 'wallet' ? 'MetaMask' : 'Razorpay'}`}
        </button>
        
        <button className="btn btn-link text-muted w-100" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
};

export default Checkout;