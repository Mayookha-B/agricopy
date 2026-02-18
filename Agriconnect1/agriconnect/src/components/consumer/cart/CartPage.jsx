import React,{useState,useEffect} from 'react';
import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import "./CartPage.css";
import axios from 'axios';

const CartPage = () => {
  // Destructure updateQty from context
  const { cart, removeFromCart, updateQty } = useCart(); 
  const navigate = useNavigate();
  const [ethRate, setEthRate] = useState(0);

  // --- FETCH LIVE RATE FOR CART ---
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
        setEthRate(res.data.ethereum.inr);
      } catch (err) {
        console.error("Cart rate fetch error:", err);
      }
    };
    fetchRate();
  }, []);

  // --- DYNAMIC CALCULATIONS ---
  // Subtotal in INR (Sum of priceInINR * qty)
  const subtotalINR = cart.reduce((acc, item) => acc + (item.priceInINR * item.qty), 0);
  
  // Subtotal in ETH (Calculated based on live rate)
  const subtotalETH = ethRate > 0 ? (subtotalINR / ethRate).toFixed(6) : "0.0000";
  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/shop')}>Go Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items-list">
          <h1>Shopping Cart</h1>
          <hr />
          {cart.map(item => {
            const itemInrTotal = (item.priceInINR * item.qty).toFixed(2);
            const itemEthTotal = ethRate > 0 ? (itemInrTotal / ethRate).toFixed(6) : "---";

            return (
              <div key={item._id} className="cart-item">
                <img src={`http://localhost:5000/${item.image?.replace(/\\/g, "/")}`} alt={item.cropName} />
                
                <div className="item-details">
                  <h3>{item.cropName}</h3>
                  <p className="instock">In Stock</p>
                  
                  <div className="qty-edit-wrapper">
                    <label>Qty:</label>
                    <div className="qty-edit-controls">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}>-</button>
                      <input type="number" value={item.qty} readOnly />
                      <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                      <span className="unit-label">kg</span>
                    </div>
                  </div>

                  <button className="delete-btn" onClick={() => removeFromCart(item._id)}>Delete</button>
                </div>

                {/* DUAL PRICE DISPLAY FOR EACH ITEM */}
                <div className="item-price-column">
                  <strong className="item-total-price-inr">₹{itemInrTotal}</strong>
                  <p className="item-total-price-eth">
                    <i className="fab fa-ethereum"></i> {itemEthTotal} ETH
                  </p>
                  <p className="unit-price-hint">(₹{item.priceInINR} / kg)</p>
                </div>
              </div>
            );
          })}
          
          <div className="cart-footer-subtotal">
            Subtotal ({cart.length} items): <strong>₹{subtotalINR.toFixed(2)}</strong> 
            <span className="footer-eth-hint"> ({subtotalETH} ETH)</span>
          </div>
        </div>

        {/* SIDEBAR WITH DUAL PRICING */}
        <div className="cart-checkout-sidebar">
          <h3>Subtotal ({cart.length} items):</h3>
          <h2 className="total-price-inr">₹{subtotalINR.toFixed(2)}</h2>
          <p className="total-price-eth-sidebar">{subtotalETH} ETH</p>
          
          <button 
            className="proceed-btn" 
            onClick={() => navigate('/checkout', { 
              state: { 
                cartItems: cart, 
                totalAmountETH: subtotalETH,
                totalAmountINR: subtotalINR
              } 
            })}
          >
            Proceed to Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;