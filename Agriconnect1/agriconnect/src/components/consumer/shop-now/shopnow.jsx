import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./shopnow.css";

const ShopNow = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState("all");
  const [customRadius, setCustomRadius] = useState("");
  const [ethRate, setEthRate] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const location = useLocation();

  /* ✅ Read search from URL */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchFromURL = queryParams.get("search") || "";
    setSearchTerm(searchFromURL);
  }, [location.search]);

  const fetchMarketplace = async (selectedRadius) => {
    try {
      setLoading(true);

      if (ethRate === 0) {
        const rateRes = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
        );
        setEthRate(rateRes.data.ethereum.inr);
      }

      let url = "http://localhost:5000/api/products/all";
      const userLoc = JSON.parse(localStorage.getItem("userLocation"));

      if (selectedRadius !== "all" && userLoc?.lat && userLoc?.lon) {
        const dist = selectedRadius === "custom" ? customRadius : selectedRadius;
        url = `http://localhost:5000/api/products/filter/nearby?lat=${userLoc.lat}&lon=${userLoc.lon}&radius=${dist}`;
      }

      const res = await axios.get(url);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Marketplace Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace("all");
  }, []);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setRadius(val);
    if (val !== "custom") fetchMarketplace(val);
  };

  if (loading) return <div className="loader">Loading Marketplace...</div>;

  /* ✅ Correct filtering */
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.cropName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="hero-overlay">
          <h1>Shop</h1>
        </div>
      </section>

      <div className="shop-container">
        <div className="toolbar">
          {/* Distance */}
          <div className="filter-controls">
            <label><i className="fas fa-map-marker-alt"></i> Distance:</label>
            <select value={radius} onChange={handleFilterChange}>
              <option value="all">Global</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Search */}
          <div className="search-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
            </select>

            <input
              type="text"
              placeholder="Search produce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {radius === "custom" && (
          <div className="custom-radius-input">
            <input
              type="number"
              placeholder="Enter km"
              value={customRadius}
              onChange={(e) => setCustomRadius(e.target.value)}
            />
            <button onClick={() => fetchMarketplace("custom")}>
              Apply
            </button>
          </div>
        )}

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => {
              const ethDisplayPrice =
                ethRate > 0
                  ? (item.priceInINR / ethRate).toFixed(6)
                  : "---";

              return (
                <div className="product-card" key={item._id}>
                  <div className="product-image">
                    <img
                      src={
                        item.image
                          ? `http://localhost:5000/${item.image.replace(/\\/g, "/")}`
                          : "/placeholder.jpg"
                      }
                      alt={item.cropName}
                    />
                  </div>

                  <div className="product-info">
                    <h3>{item.cropName}</h3>
                    <p>₹{item.priceInINR}/kg</p>
                    <span>{ethDisplayPrice} ETH</span>

                    <Link to={`/product/${item._id}`} className="view-details-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-products">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopNow;
