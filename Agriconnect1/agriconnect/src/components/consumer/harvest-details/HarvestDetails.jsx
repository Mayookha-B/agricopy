import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MDBIcon, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBBtn } from 'mdb-react-ui-kit';

const HarvestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [harvest, setHarvest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [totalINR, setTotalINR] = useState(0);
  const [totalETH, setTotalETH] = useState(0);
  const [ethRate, setEthRate] = useState(0); // Live conversion rate

  useEffect(() => {
    // 1. Fetch Harvest and Live Crypto Price simultaneously
    const loadData = async () => {
      try {
        // Fetch Harvest details from your backend
        const harvestRes = await axios.get(`http://localhost:5000/api/products/upcoming/${id}`);
        const harvestData = harvestRes.data;
        
        // Fetch Live ETH price in INR from CoinGecko
        const priceRes = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
        );
        
        const inrPriceOfOneEth = priceRes.data.ethereum.inr;
        const currentRate = 1 / inrPriceOfOneEth;

        setHarvest(harvestData);
        setEthRate(currentRate);
        
        // Initial Calculations
        setSelectedQty(harvestData.quantity);
        const initialINR = harvestData.quantity * harvestData.priceInINR;
        setTotalINR(initialINR);
        setTotalETH((initialINR * currentRate).toFixed(8));
        
        setLoading(false);
      } catch (err) {
        console.error("Initialization Error:", err);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle Dynamic Quantity and Price Updates
  const handleQtyChange = (val) => {
    const qty = Math.min(Math.max(1, val), harvest.quantity); // Prevent over-booking
    setSelectedQty(qty);
    const newINR = qty * harvest.priceInINR;
    setTotalINR(newINR);
    // Update ETH based on the dynamic live rate
    setTotalETH((newINR * ethRate).toFixed(8));
  };

  const handleBooking = () => {
    navigate("/checkout", {
      state: {
        product: harvest,
        qty: selectedQty,
        totalAmountINR: totalINR,
        totalAmountETH: totalETH, // Passing live calculated ETH to Checkout
        isUpcoming: true
      }
    });
  };

  if (loading) return <div className="text-center py-5"><h4><MDBIcon fas icon="sync" spin /> Fetching Live Market Data...</h4></div>;
  if (!harvest) return <div className="text-center py-5"><h4>Forecast Details Not Found.</h4></div>;

  return (
    <MDBContainer className="py-5">
      <MDBRow>
        {/* LEFT COLUMN: Media & Location */}
        <MDBCol lg="5" className="mb-4">
          <img 
            src={`http://localhost:5000/${harvest.image?.replace(/\\/g, "/")}`} 
            alt="Crop" className="img-fluid rounded shadow mb-3"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />
          <MDBCard className="border-0 shadow-sm bg-light">
            <MDBCardBody>
              <h6 className="fw-bold text-success"><MDBIcon fas icon="map-marker-alt" /> Farm Location</h6>
              <p className="small mb-1">{harvest.manualAddress}</p>
              <div className="d-flex gap-2 mt-2">
                 <span className="badge bg-dark">Lat: {harvest.location?.coordinates[1]}</span>
                 <span className="badge bg-dark">Lon: {harvest.location?.coordinates[0]}</span>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* RIGHT COLUMN: Details & Customization */}
        <MDBCol lg="7">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="fw-bold mb-0">{harvest.cropName}</h2>
            <span className="badge bg-success p-2">{harvest.category}</span>
          </div>
          <h4 className="text-success mb-4">₹{harvest.priceInINR} <small className="text-muted">/ kg</small></h4>

          {/* Pricing Dashboard with Live ETH conversion */}
          <MDBCard className="border-0 shadow-sm mb-4 bg-light" style={{borderLeft: '5px solid #ffc107'}}>
            <MDBCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0"><MDBIcon fas icon="calculator" /> Custom Booking</h6>
                <span className="badge bg-warning text-dark">Live Rate: 1 ETH ≈ ₹{(1/ethRate).toLocaleString()}</span>
              </div>
              <MDBRow className="align-items-center">
                <MDBCol md="5">
                  <label className="small text-muted mb-1">Quantity (kg):</label>
                  <input 
                    type="number" className="form-control" 
                    value={selectedQty} 
                    onChange={(e) => handleQtyChange(e.target.value)}
                  />
                </MDBCol>
                <MDBCol md="7" className="text-end">
                   <div className="mb-1">
                     <span className="small text-muted d-block">Subtotal:</span>
                     <h3 className="fw-bold mb-0">₹{totalINR.toLocaleString('en-IN')}</h3>
                   </div>
                   <div className="text-warning fw-bold">
                     <MDBIcon fab icon="ethereum" /> {totalETH} ETH
                   </div>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>

          {/* Detailed Info Tabs */}
          <MDBRow className="mb-4">
            <MDBCol md="6">
              <div className="p-3 border rounded h-100 bg-white shadow-sm">
                <h6 className="text-primary fw-bold small text-uppercase">Farmer Credentials</h6>
                <p className="mb-1"><strong>{harvest.farmerId?.fullName || "Verified Farmer"}</strong></p>
                <p className="mb-0 small text-muted">ID: {harvest.farmerId?.farmerCustomId || "AGRI-99"}</p>
                <p className="mb-0 small text-muted">Phone: {harvest.farmerId?.phone || "Private"}</p>
              </div>
            </MDBCol>
            <MDBCol md="6">
              <div className="p-3 border rounded h-100 bg-white shadow-sm">
                <h6 className="text-warning fw-bold small text-uppercase">Harvest Timeline</h6>
                <p className="mb-1"><strong>{new Date(harvest.expectedHarvestDate).toLocaleDateString('en-IN', {dateStyle: 'long'})}</strong></p>
                <p className="mb-0 small">Status: <span className="text-success fw-bold">{harvest.status}</span></p>
                <p className="mb-0 small text-muted">Available: {harvest.quantity} kg</p>
              </div>
            </MDBCol>
          </MDBRow>


          <MDBBtn color="success" size="lg" block onClick={handleBooking}>
            Proceed to Checkout
          </MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default HarvestDetails;