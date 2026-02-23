import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MDBIcon, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import "./ForecastDashboard.css";
// Add 'useNavigate' to your imports
import { useNavigate } from "react-router-dom";

const BuyerForecastDashboard = () => {
  const [harvests, setHarvests] = useState([]);
  const [filter, setFilter] = useState("All");
  
  // Ensure these match your Add Harvest dropdown EXACTLY
  const categories = ["All", "Grains", "Vegetables", "Fruits", "Pulses", "Spices", "Other"];

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/upcoming/all")
      .then(res => {
        console.log("Data fetched successfully:", res.data); // DEBUG HERE
        setHarvests(res.data);
      })
      .catch(err => console.error("Error fetching forecast:", err));
  }, []);

  const handleBookNow = (item) => {
    // Redirect to checkout and pass the harvest data
    navigate("/checkout", {
      state: {
        product: item,
        qty: item.quantity, // Default to full yield or let them choose
        totalAmountINR: item.priceInINR * item.quantity,
        totalAmountETH: (item.priceInINR * item.quantity * 0.000003).toFixed(4), // Example conversion
        isUpcoming: true // Flag to tell checkout this is a future harvest
      }
    });
    };

  const filteredHarvests = filter === "All" 
    ? harvests 
    : harvests.filter(h => h.category === filter);

  return (
    <MDBContainer className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><MDBIcon fas icon="chart-line" className="text-success me-2" />3-Month Supply Forecast</h2>
        
        <div className="d-flex align-items-center">
          <span className="me-2 fw-bold text-muted">Filter:</span>
          <select className="form-select w-auto" onChange={(e) => setFilter(e.target.value)}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <MDBRow>
        {filteredHarvests.length > 0 ? (
          filteredHarvests.map((item) => (
            <MDBCol md="4" key={item._id} className="mb-4">
              <MDBCard className="h-100 shadow-sm border-0">
                <div className="harvest-date-badge">
                  {new Date(item.expectedHarvestDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
                <MDBCardBody>
                  <h5 className="fw-bold">{item.cropName}</h5>
                  <p className="small text-muted mb-2"><MDBIcon fas icon="tag" /> {item.category}</p>
                  <div className="d-flex justify-content-between mb-3 p-2 bg-light rounded">
                    <div><span className="d-block small text-muted">Est. Yield</span><strong>{item.quantity} kg</strong></div>
                    <div className="text-end"><span className="d-block small text-muted">Target Price</span><strong className="text-success">₹{item.priceInINR}/kg</strong></div>
                  </div>
                  <div className="text-center small text-success fw-bold">
                    <MDBIcon fas icon="shield-alt" /> Risk Protected by Smart Contract
                  </div>
                  {/* NEW BOOKING BUTTON */}
                <button 
                  className="btn btn-success mt-auto w-100" 
                  onClick={() => handleBookNow(item)}
                >
                  <MDBIcon fas icon="shopping-basket" className="me-2" />
                  Book Harvest Now
                </button>
                
                <Link to={`/harvest-details/${item._id}`} className="text-center mt-2 small text-muted">
                  View Prediction Details
                </Link>

                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))
        ) : (
          <div className="text-center py-5 w-100">
            <MDBIcon fas icon="calendar-times" size="3x" className="text-muted mb-3" />
            <h4>No upcoming harvests found.</h4>
          </div>
        )}
      </MDBRow>
    </MDBContainer>
  );
};

export default BuyerForecastDashboard;