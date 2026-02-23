import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBBtn, MDBIcon, MDBTypography 
} from 'mdb-react-ui-kit';

const FarmersDirectory = () => {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        // Matches your farmer.js route
        const response = await axios.get("http://localhost:5000/api/farmer/all");
        
        // Log to browser console to verify data arrival
        console.log("Farmers found in DB:", response.data);
        
        setFarmers(response.data);
        setFilteredFarmers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  // Filter logic based on user search
  useEffect(() => {
    const results = farmers.filter(f =>
      f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farmerCustomId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFarmers(results);
  }, [searchTerm, farmers]);

  if (loading) return (
    <div className="text-center py-5">
      <MDBIcon fas icon="leaf" spin size="3x" className="text-success mb-3" />
      <MDBTypography tag='h4'>Loading Farmer Network...</MDBTypography>
    </div>
  );

  return (
    <MDBContainer className="py-5">
      <div className="text-center mb-5">
        <MDBTypography tag='h2' className="fw-bold text-success">Farmer Directory</MDBTypography>
        <p className="text-muted">Connect directly with the producers of Kerala.</p>
        
        <MDBRow className="justify-content-center mt-4">
          <MDBCol md="6">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 ps-4">
                <MDBIcon fas icon="search" className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 py-3"
                placeholder="Search by name or ID (e.g. F-123)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{boxShadow: 'none'}}
              />
            </div>
          </MDBCol>
        </MDBRow>
      </div>

      <MDBRow>
        {filteredFarmers.length > 0 ? filteredFarmers.map((farmer) => (
          <MDBCol md="6" lg="4" key={farmer._id} className="mb-4">
            <MDBCard className="h-100 shadow-2 border-0 rounded-4">
              <MDBCardBody className="text-center p-4">
                <div className="rounded-circle bg-success-subtle d-inline-block p-3 mb-3" style={{backgroundColor: '#e8f5e9'}}>
                  <MDBIcon fas icon="user-circle" size="4x" className="text-success" />
                </div>
                <MDBTypography tag='h5' className="fw-bold mb-1">{farmer.fullName}</MDBTypography>
                <p className="text-muted small mb-4">
                    <MDBIcon fas icon="id-badge" className="me-2"/>
                    {farmer.farmerCustomId || "Pending Verification"}
                </p>
                <MDBBtn 
                  color="success" rounded block 
                  onClick={() => navigate(`/farmer/${farmer._id}`)}
                >
                  View Products & Forecasts
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        )) : (
          <div className="text-center w-100 py-5">
            <MDBIcon fas icon="folder-open" size="3x" className="text-muted mb-3" />
            <p className="text-muted">No farmers registered or matching your search.</p>
          </div>
        )}
      </MDBRow>
    </MDBContainer>
  );
};

export default FarmersDirectory;