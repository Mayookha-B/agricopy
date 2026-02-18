import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "./ConsumerPage.css";
import { useCart } from "../../../context/CartContext";

const ConsumerPage = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [locationName, setLocationName] = useState("Locating...");
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false); // Account Dropdown State
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    // 1. Authentication & Role Check
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'consumer') {
      navigate('/consumer-login');
    }

    // 2. Initial High-Accuracy Fetch
    autoFetchExactLocation();
  }, [navigate]);

  // --- FEATURE: LOGOUT ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/consumer-login');
  };

  // --- FEATURE: HIGH-ACCURACY GPS FETCH ---
  const autoFetchExactLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          updateExactLocation(latitude, longitude);
        },
        (err) => {
          console.error("GPS Error:", err.message);
          setLocationName("Set Location");
        },
        options
      );
    }
  };

  // --- FEATURE: REVERSE GEOCODING ---
  const updateExactLocation = async (lat, lon, customName = null) => {
    setCoords({ lat, lon });
    let displayName = customName;

    if (!displayName) {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const addr = res.data.address;
        displayName = addr.neighbourhood || addr.suburb || addr.road || addr.village || addr.city || "Exact Location";
      } catch (err) {
        displayName = "Custom Location";
      }
    }

    setLocationName(displayName);
    localStorage.setItem('userLocation', JSON.stringify({ lat, lon, name: displayName }));
  };

  const handleManualSearch = async () => {
    if (!manualInput) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualInput)}`);
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        updateExactLocation(parseFloat(lat), parseFloat(lon), display_name);
        setManualInput("");
        setShowLocationMenu(false);
      }
    } catch (err) {
      alert("Address not found");
    }
  };

  const { cart } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="landing-container">
      {/* --- AMAZON-STYLE TOPBAR --- */}
      <nav className="navbar-top">
        {/* LEFT: LOGO & LOCATION */}
        <div className="nav-left-group">
          <div className="nav-logo-section">
            <img src="/logo.png" alt="AgriConnect Logo" className="navbar-logo-img" />
            <span className="logo-text-branding">
              agri<span style={{ color: '#b9f319ff' }}>connect</span>
            </span>
          </div>

          <div className="location-box-amazon" onClick={() => setShowLocationMenu(!showLocationMenu)}>
            <i className="fas fa-map-marker-alt"></i>
            <div className="loc-text-details">
              <span className="nav-line-1">Delivering to {locationName}</span>
              <span className="nav-line-2">Update location</span>
            </div>
            <i className="fas fa-caret-down ms-1 icon-small"></i>

            {showLocationMenu && (
              <div className="location-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                <p className="panel-title">Change Delivery Area</p>
                <div className="manual-box">
                  <input 
                    type="text" 
                    placeholder="Enter street or area..." 
                    value={manualInput} 
                    onChange={(e) => setManualInput(e.target.value)} 
                  />
                  <button onClick={handleManualSearch}>Go</button>
                </div>
                <button className="gps-btn-precise" onClick={autoFetchExactLocation}>
                  <i className="fas fa-crosshairs"></i> Refresh Exact GPS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: SEARCH BAR */}
        <div className="nav-search-fill">
          <div className="search-container-inner">
            <select className="search-cat-dropdown">
              <option>All</option>
              <option>Fruits</option>
              <option>Vegetables</option>
            </select>
            <input type="text" placeholder="Search products..." />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* RIGHT: NAVIGATION & UTILITIES */}
        <div className="nav-right-utility">
          <ul className="nav-links">
            <li>Home</li>
            <li><Link to="/shop">Shop</Link></li>
            
            <Link to="/cart" className="cart-icon-wrapper">
      <div className="cart-badge-container">
        <span className="cart-count">{cartItemCount}</span>
        <i className="fas fa-shopping-cart"></i>
      </div>
      <span className="nav-line-2">Cart</span>
    </Link>
          </ul>

          {/* DROPDOWN ACCOUNT SECTION */}
          <div 
            className="nav-item-account"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <span className="nav-line-1">Hello, Sign in</span>
            <span className="nav-line-2">Account & Lists <i className="fas fa-caret-down"></i></span>
            
            {showAccountMenu && (
              <div className="account-dropdown-panel">
                <ul className="account-menu-list">
                  <li><Link to="/profile">My Profile</Link></li>
                  <li><Link to="/my-orders">My Orders</Link></li>
                  <hr className="dropdown-divider" />
                  <li className="sign-out-item" onClick={handleLogout}>Sign Out</li>
                </ul>
              </div>
            )}
          </div>

          <div className="nav-item"><i className="fas fa-bell"></i></div>
          <div className="nav-item">
            <Link to="/consumer-help" style={{ color: 'inherit' }}>
                <i className="fas fa-question-circle"></i>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" style={{ backgroundImage: `url("https://images.pexels.com/photos/551997/pexels-photo-551997.jpeg?auto=compress&cs=tinysrgb&w=1600")` }}>
        <div className="hero-overlay">
          <p className="hero-subtitle">WELCOME TO AGRICONNECT MARKETPLACE</p>
          <h1 className="hero-title">
            Fresh Fruits & Vegetables <br />
            Delivered to Your Fingertips
          </h1>
          <Link to="/shop">
            <button className="shop-btn">Shop Now</button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div><h3>Secure Payments</h3><p>Safe transactions guaranteed</p></div>
        <div><h3>Free Delivery</h3><p>Orders above ₹199</p></div>
        <div><h3>Farm Fresh</h3><p>Direct from farmers</p></div>
        <div><h3>24×7 Support</h3><p>We are here for you</p></div>
      </section>

      {/* CATEGORIES */}
      <section className="category-section">
        <h2>Our Categories</h2>
        <div className="categories">
          <div>
            <img src="https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Fruits" />
            <p>Fresh Fruits</p>
          </div>
          <div>
            <img src="https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Vegetables" />
            <p>Organic Vegetables</p>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38')" }}>
        <div className="cta-overlay">
          <h2>Ready to Find Your Perfect Produce?</h2>
          <p>Browse fresh fruits and vegetables from trusted farmers, delivered directly to your doorstep.</p>
          <Link to="/shop">
            <button className="shop-btn">Shop Now</button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 AgriConnect - Connecting Farmers and Consumers</p>
      </footer>
    </div>
  );
};

export default ConsumerPage;