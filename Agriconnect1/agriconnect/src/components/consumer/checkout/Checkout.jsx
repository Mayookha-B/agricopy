import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MDBIcon // Add this here
} from 'mdb-react-ui-kit';
import { ethers } from "ethers"; // Essential for MetaMask
import { useCart } from "../../../context/CartContext"; // Import Cart Context
import "./Checkout.css";
import EscrowABI from "../../../contracts/EscrowABI.json";



// Use the ABI from the JSON file and your Hardhat deployment address
const ESCROW_ABI = EscrowABI;
const ESCROW_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Extract both INR and ETH totals passed from previous page
  const { product, qty, totalAmountETH, totalAmountINR, cartItems } = location.state || {};
  const [processing, setProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // If the user lands here without data, redirect to shop
  useEffect(() => {
    if (!product && !cartItems) {
      navigate("/shop");
    }
    checkWalletConnection();
  }, [product, cartItems, navigate]);

  // Check if MetaMask is connected
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) setWalletAddress(accounts[0]);
    }
  };

  const handleBlockchainPayment = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed with the transaction.");
      return null;
    }

    try {
        const directNode = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();

      // Log the address to be 100% sure MetaMask is using Account 0
        const currentAddress = await signer.getAddress();
        console.log("MetaMask is currently using address:", currentAddress);

        const balance = await directNode.getBalance(currentAddress);
      console.log("Actual Blockchain Balance:", ethers.formatEther(balance), "ETH");
      
      if (balance === 0n) {
        console.error("The blockchain node says your wallet is empty! Check your Chain ID.");
      }
      

      // VALIDATE ABI: Log this to your console to check if it's undefined
      console.log("Using ABI:", ESCROW_ABI); 
      if (!ESCROW_ABI) throw new Error("ABI is undefined. Check your JSON import.");

      // Initialize the Contract Instance
      const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

      // We need the farmer's wallet address. 
      // For cart items, we'll use the first one's farmer for this demo, 
      // or you can implement a multi-seller split logic later.
      const sellerWallet = cartItems ? "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" : (product.farmerWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

      // Ensure totalAmountETH is a string and exists
      const ethValue = totalAmountETH ? Number(totalAmountETH).toFixed(18) : "0";
      console.log("Attempting to pay:", ethValue, "ETH"); // CHECK YOUR CONSOLE FOR THIS

      // TRIGGER METAMASK POPUP
      const tx = await escrowContract.deposit(sellerWallet, {
        value: ethers.parseEther(ethValue),
        gasLimit: 100000, // Hardcode gas to bypass MetaMask's buggy estimation
    });

      console.log("Mining transaction...", tx.hash);
      const receipt = await tx.wait();

      // 1. Filter logs that match your contract's address first
      const contractLogs = receipt.logs.filter(log => 
          log.address.toLowerCase() === ESCROW_ADDRESS.toLowerCase()
      );
      // 1. Manually find and parse the OrderPlaced log
      const orderPlacedLog = contractLogs.map(log => {
        try {
            return escrowContract.interface.parseLog(log);
        } catch (e) {
        return null;
        }
      }).find(event => event && event.name === "OrderPlaced");

      let blockchainOrderId = null;

      if (orderPlacedLog) {
        blockchainOrderId = orderPlacedLog.args.orderId 
        ? orderPlacedLog.args.orderId.toString() 
        : orderPlacedLog.args[0].toString(); 
      }

      console.log("SUCCESSFULLY CAPTURED ID:", blockchainOrderId);
        // Return both the hash and the ID to handleConfirmOrder
      return { hash: tx.hash, id: blockchainOrderId };

    } catch (err) {
      console.error("Blockchain Error:", err);
      alert("Payment failed or cancelled in MetaMask.");
      return null;
    }
  };

  const handleConfirmOrder = async () => {
    setProcessing(true);
    
    // 1. Trigger MetaMask first
    const result = await handleBlockchainPayment();
    console.log("Captured Blockchain ID:", result.id);

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
            blockchainOrderId: result.id, // Store the proof of payment
            status: "Active"
          }))
        : [{
            productId: product._id,
            farmerId: product.farmerId._id || product.farmerId,
            quantity: qty,
            totalPrice: totalAmountINR,
            transactionHash: result.hash,
            blockchainOrderId: result.id,
            status: "Active"
          }];

      for (const order of ordersToPlace) {
        await axios.post("http://localhost:5000/api/orders/place", order, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (cartItems) clearCart(); 
      alert("Success! Funds held in Escrow. Order placed.");
      navigate("/my-orders");

    } catch (err) {
      alert("Order recording failed. Please contact support with TxHash: " + result.hash);
    } finally {
      setProcessing(false);
    }
  };

  if (!product && !cartItems) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h2 className="checkout-title">Blockchain Checkout</h2>
        
        <div className="checkout-items-preview">
          {cartItems ? (
            cartItems.map(item => (
              <div key={item._id} className="checkout-row">
                <img src={`http://localhost:5000/${item.image?.replace(/\\/g, "/")}`} alt={item.cropName} />
                <span>{item.cropName} (x{item.qty}kg)</span>
                <strong>₹{item.priceInINR * item.qty}</strong>
              </div>
            ))
          ) : (
            <div className="checkout-row">
              <img src={`http://localhost:5000/${product.image?.replace(/\\/g, "/")}`} alt={product.cropName} />
              <span>{product.cropName} (x{qty}kg)</span>
              <strong>₹{totalAmountINR}</strong>
            </div>
          )}
        </div>

        <div className="checkout-billing">
          <div className="billing-item">
            <span>Stable Subtotal (INR):</span>
            <span>₹{totalAmountINR}</span>
          </div>
          <div className="billing-item grand-total">
            <span>Payable Amount (ETH):</span>
            <span><i className="fab fa-ethereum"></i> {totalAmountETH} ETH</span>
          </div>
        </div>

        <div className="wallet-status-box">
          {walletAddress ? (
            <p className="text-success small">
              <MDBIcon fas icon="check-circle" /> Connected: {walletAddress.substring(0,6)}...{walletAddress.substring(38)}
            </p>
          ) : (
            <p className="text-danger small">Please connect MetaMask</p>
          )}
        </div>

        <button className="confirm-btn" onClick={handleConfirmOrder} disabled={processing}>
          {processing ? "Processing Blockchain Transaction..." : `Pay ${totalAmountETH} ETH via MetaMask`}
        </button>
        
        <button className="cancel-text" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
};

export default Checkout;