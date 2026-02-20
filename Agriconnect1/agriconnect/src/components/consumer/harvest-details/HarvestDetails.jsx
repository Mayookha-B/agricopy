import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MDBIcon, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBBtn } from 'mdb-react-ui-kit';

const HarvestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [harvest, setHarvest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log the ID to verify it is being passed correctly from the URL
    console.log("Fetching details for ID:", id); 
    
    axios.get(`http://localhost:5000/api/products/upcoming/${id}`)
      .then(res => {
        setHarvest(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching forecast details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-5"><h4><MDBIcon fas icon="sync" spin /> Loading Forecast...</h4></div>;
  if (!harvest) return <div className="text-center py-5"><h4>No harvest details found for ID: {id}</h4></div>;

  return (
    <MDBContainer className="py-5">
      <MDBRow>
        {/* Farm Image & Location GPS */}
        <MDBCol lg="5">
          <img 
            src={`http://localhost:5000/${harvest.image?.replace(/\\/g, "/")}`} 
            alt="Harvest" className="img-fluid rounded shadow mb-3" 
            style={{ width: '100%', height: '380px', objectFit: 'cover' }}
          />
          <div className="p-3 bg-light rounded border">
            <h6 className="fw-bold text-success"><MDBIcon fas icon="map-marker-alt" /> Verified Farm Coordinates</h6>
            <p className="small mb-1">{harvest.manualAddress}</p>
            <div className="d-flex gap-2">
               <span className="badge bg-dark">Lat: {harvest.location?.coordinates[1]}</span>
               <span className="badge bg-dark">Lon: {harvest.location?.coordinates[0]}</span>
            </div>
          </div>
        </MDBCol>

        {/* Product and Farmer Details */}
        <MDBCol lg="7">
          <h2 className="fw-bold text-dark">{harvest.cropName} <span className="badge bg-info ms-2" style={{fontSize: '14px'}}>{harvest.category}</span></h2>
          <h3 className="text-success">₹{harvest.priceInINR}/kg</h3>

          <hr />

          <MDBRow className="mb-4">
            <MDBCol md="6">
              <div className="p-3 border rounded h-100 bg-white">
                <h6 className="text-primary fw-bold small text-uppercase">Farmer Details</h6>
                <p className="mb-1"><strong>Name:</strong> {harvest.farmerId?.fullName || "Verified Member"}</p>
                <p className="mb-1 small"><strong>ID:</strong> {harvest.farmerId?.farmerCustomId || "AGRI-990"}</p>
              </div>
            </MDBCol>
            <MDBCol md="6">
              <div className="p-3 border rounded h-100 bg-white">
                <h6 className="text-warning fw-bold small text-uppercase">Yield Forecast</h6>
                <p className="mb-1"><strong>Est. Date:</strong> {new Date(harvest.expectedHarvestDate).toLocaleDateString()}</p>
                <p className="mb-0"><strong>Total Yield:</strong> {harvest.quantity} kg</p>
              </div>
            </MDBCol>
          </MDBRow>

         

          <MDBBtn color="success" size="lg" block onClick={() => navigate("/checkout", { state: { product: harvest } })}>
            Proceed to Booking
          </MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default HarvestDetails;