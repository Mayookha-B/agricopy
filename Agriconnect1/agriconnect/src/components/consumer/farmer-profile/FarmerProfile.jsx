import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBBtn, MDBIcon, MDBTypography, MDBBadge, MDBInput
} from 'mdb-react-ui-kit';

const FarmerProfile = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  
  const [farmer, setFarmer] = useState(null);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [upcomingHarvests, setUpcomingHarvests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        // 1. Fetch Farmer Credentials
        const farmerRes = await axios.get(`http://localhost:5000/api/farmer/details/${farmerId}`);
        setFarmer(farmerRes.data);

        // 2. Fetch Current Harvested Products
        const productsRes = await axios.get(`http://localhost:5000/api/products/farmer/${farmerId}`);
        setCurrentProducts(productsRes.data);

        // 3. Fetch Upcoming Harvests (Forecasts)
        const upcomingRes = await axios.get(`http://localhost:5000/api/products/upcoming/farmer/${farmerId}`);
        setUpcomingHarvests(upcomingRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    };
    fetchFarmerData();
  }, [farmerId]);

  // Combined Filter Logic for both categories
  const filterList = (list) => list.filter(item => 
    item.cropName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-5"><MDBIcon fas icon="sync" spin size="3x" /></div>;

  return (
    <MDBContainer className="py-5">
      {/* Farmer Bio Header */}
      <MDBCard className="shadow-0 border-0 mb-5 bg-success text-white rounded-4">
        <MDBCardBody className="p-4 d-flex align-items-center">
          <MDBIcon fas icon="user-circle" size="5x" className="me-4" />
          <div>
            <MDBTypography tag='h2' className="fw-bold mb-1">{farmer?.fullName}</MDBTypography>
            <p className="mb-0 small"><MDBIcon fas icon="id-badge" /> {farmer?.farmerCustomId}</p>
            <p className="mb-0 small"><MDBIcon fas icon="map-marker-alt" /> Nadapuram, Kerala</p>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* Global Filter */}
      <div className="mb-5">
        <MDBInput 
          label='Search inside this farmer’s shop...' 
          id='filter' 
          type='text' 
          size="lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <MDBRow>
        {/* SECTION 1: HARVESTED PRODUCTS (Ready to Buy) */}
        <MDBCol lg="6" className="mb-4">
          <h4 className="fw-bold mb-4"><MDBIcon fas icon="shopping-basket" className="text-success me-2" /> Harvested Items</h4>
          {filterList(currentProducts).length > 0 ? filterList(currentProducts).map(item => (
            <MDBCard key={item._id} className="mb-3 border-0 shadow-sm rounded-3">
              <MDBCardBody className="d-flex align-items-center p-3">
                <img src={`http://localhost:5000/${item.image?.replace(/\\/g, "/")}`} style={{width: '70px', height: '70px', objectFit: 'cover'}} className="rounded me-3" alt={item.cropName} />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0">{item.cropName}</h6>
                  <p className="text-success small mb-0 fw-bold">₹{item.priceInINR}/kg</p>
                  <small className="text-muted">Stock: {item.quantity} kg</small>
                </div>
                <MDBBtn color="success" size="sm" onClick={() => navigate(`/product/${item._id}`)}>Buy Now</MDBBtn>
              </MDBCardBody>
            </MDBCard>
          )) : <p className="text-muted small">No harvested items match your filter.</p>}
        </MDBCol>

        {/* SECTION 2: UPCOMING HARVESTS (Forecasts) */}
        <MDBCol lg="6">
          <h4 className="fw-bold mb-4"><MDBIcon fas icon="chart-line" className="text-primary me-2" /> Upcoming Forecasts</h4>
          {filterList(upcomingHarvests).length > 0 ? filterList(upcomingHarvests).map(harvest => (
            <MDBCard key={harvest._id} className="mb-3 border-0 shadow-sm rounded-3" style={{borderLeft: '5px solid #007bff'}}>
              <MDBCardBody className="d-flex align-items-center p-3">
                <img src={`http://localhost:5000/${harvest.image?.replace(/\\/g, "/")}`} style={{width: '70px', height: '70px', objectFit: 'cover'}} className="rounded me-3" alt={harvest.cropName} />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <h6 className="fw-bold mb-0">{harvest.cropName}</h6>
                    <MDBBadge color="primary" light>Booking Open</MDBBadge>
                  </div>
                  <p className="small mb-1 text-muted">Estimated: {new Date(harvest.expectedHarvestDate).toLocaleDateString()}</p>
                </div>
                <MDBBtn outline color="primary" size="sm" className="ms-3" onClick={() => navigate(`/forecast-details/${harvest._id}`)}>Book</MDBBtn>
              </MDBCardBody>
            </MDBCard>
          )) : <p className="text-muted small">No upcoming forecasts match your filter.</p>}
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default FarmerProfile;