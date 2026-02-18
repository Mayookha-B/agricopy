import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";
import { useCart } from "../../../context/CartContext"; // Hook is already imported

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [ethRate, setEthRate] = useState(null); // To store current ETH price in INR
  
  // --- ACTIVATE CART HOOK ---
  const { addToCart } = useCart(); 

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);

        // 2. Fetch Live ETH Rate from CoinGecko
        const rateRes = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
        );
        setEthRate(rateRes.data.ethereum.inr);

      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };
    fetchDetails();
  }, [id]);

  if (!product) return <div className="loader">Loading details...</div>;

  // --- DYNAMIC PRICE CALCULATIONS ---
  // Unit Price in ETH
  const unitPriceEth = (product.priceInINR / ethRate).toFixed(6);
  
  // Totals
  const totalInr = (product.priceInINR * qty).toFixed(2);
  const totalEth = (totalInr / ethRate).toFixed(6);

  // --- ADD TO CART HANDLER ---
  const handleAddToCart = () => {
    // We pass the full product object and the current state qty
    const cartItem = { 
      ...product, 
      ethAtAddedTime: unitPriceEth 
    };
    addToCart(cartItem, qty);
    alert(`${product.cropName} added to cart!`);
  };

  return (
    <div className="product-details-page">
      <div className="details-card">
        {/* IMAGE SECTION */}
        <div className="details-image">
          <img 
            src={`http://localhost:5000/${product.image.replace(/\\/g, "/")}`} 
            alt={product.cropName} 
          />
        </div>

        {/* INFO SECTION */}
        <div className="details-info">
          <span className="badge">{product.category}</span>
          <h1>{product.cropName}</h1>
          
          {/* PRODUCT ID BOX */}
          <div className="pid-box">
            <span className="label">Product ID:</span>
            <span className="value">#{product._id.toUpperCase()}</span>
          </div>

          {/* DUAL PRICE DISPLAY */}
          <div className="price-container">
            <div className="price-main">₹{product.priceInINR} <small>/ kg</small></div>
            <div className="price-eth-sub">
              <i className="fab fa-ethereum"></i> {unitPriceEth} ETH
            </div>
          </div>
          
          {/* HARVEST & EXPIRY SECTION */}
          <div className="date-details">
            <div className="date-item">
              <i className="fas fa-seedling"></i>
              <div>
                <p className="label">Harvest Date</p>
                <p className="value">{new Date(product.harvestDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="date-item">
              <i className="fas fa-hourglass-end"></i>
              <div>
                <p className="label">Expiry Date</p>
                <p className="value">{new Date(product.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <hr />

          <div className="qty-custom">
            <label>Select Quantity (kg):</label>
            <div className="qty-input">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <input type="number" value={qty} readOnly />
              <button onClick={() => setQty(Math.min(product.quantity, qty + 1))}>+</button>
            </div>
            <small>Available: {product.quantity} kg</small>
          </div>

          <div className="bill-box">
            <div className="bill-row">
              <span>Total (INR):</span>
              <strong>₹{totalInr}</strong>
            </div>
            <div className="bill-row eth-total">
              <span>Total (ETH):</span>
              <h2>{totalEth} ETH</h2>
            </div>
          </div>

          <div className="detail-actions">
            {/* LINKED TO HANDLER */}
            <button className="cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
            
            <button 
              className="buy-btn" 
              onClick={() => navigate('/checkout', { state: { product, qty, totalEth, totalInr } })}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;