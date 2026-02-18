import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [userName, setUserName] = useState("Sign in");
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/consumer-login");
  };

  return (
    <nav className="navbar-top">
      <div className="nav-left-group">
        <Link to="/consumer-page" className="nav-logo-section">
          <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
          <span className="logo-text-branding">agri<span>connect</span></span>
        </Link>
      </div>

      <div className="nav-search-fill">
        <div className="search-container-inner">
          <input type="text" placeholder="Search for fresh produce..." />
          <button className="search-btn"><i className="fas fa-search"></i></button>
        </div>
      </div>

      <div className="nav-right-utility">
        <ul className="nav-links">
          <li><Link to="/consumer-page">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
        </ul>

        <div className="nav-item-account" 
             onMouseEnter={() => setShowAccountMenu(true)} 
             onMouseLeave={() => setShowAccountMenu(false)}>
          <span className="nav-line-1">Hello, {userName}</span>
          <span className="nav-line-2">Account & Lists <i className="fas fa-caret-down"></i></span>
          {showAccountMenu && (
            <div className="account-dropdown">
              <div className="dropdown-arrow"></div>
              <Link to="/my-orders">Your Orders</Link>
              <hr />
              <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>

        <Link to="/cart" className="cart-icon-wrapper">
          <div className="cart-count-badge">{cartCount}</div>
          <i className="fas fa-shopping-cart"></i>
          <span className="nav-line-2">Cart</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;