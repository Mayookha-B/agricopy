import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MDBIcon, MDBBtn, MDBInput, MDBTextArea } from 'mdb-react-ui-kit';
import "./AddUpcomingHarvest.css";

const AddUpcomingHarvest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: "",
    category: "", // Now controlled by a dropdown
    expectedHarvestDate: "",
    quantity: "",
    priceInINR: "",
    manualAddress: "",
    lat: "",
    lon: ""
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Categories for the dropdown
  const categories = ["Grains", "Vegetables", "Fruits", "Pulses", "Spices", "Other"];

  /**
   * AUTO-FETCH GEOLOCATION
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Please enable location services to list a crop with GPS data.");
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lon) {
      alert("GPS coordinates are required for predictive forecasting.");
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token");
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/products/add-upcoming", data, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      alert("Success! Your upcoming harvest is now listed for bulk buyers.");
      navigate("/prediction-dashboard");
    } catch (err) {
      alert("Failed to add harvest: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-harvest-container">
      <div className="harvest-form-card">
        <h2 className="text-center mb-4">
          <MDBIcon fas icon="seedling" className="me-2 text-success" />
          List Upcoming Harvest
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <MDBInput label="Crop Name" name="cropName" onChange={handleChange} required />
            </div>
            
            {/* CATEGORY DROPDOWN */}
            <div className="col-md-6 mb-3">
              <select 
                className="form-select custom-select" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <MDBInput 
                label="Expected Harvest Date" 
                type="date" 
                name="expectedHarvestDate" 
                onChange={handleChange} 
                required 
                min={new Date().toISOString().split("T")[0]} 
              />
            </div>
            <div className="col-md-6 mb-3">
              <MDBInput label="Estimated Yield (kg)" type="number" name="quantity" onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <MDBInput label="Target Price (per kg)" type="number" name="priceInINR" onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
            </div>
          </div>

          <MDBTextArea label="Farm Address / Specific Location" name="manualAddress" className="mb-3" onChange={handleChange} rows={3} required />

          {/* AUTO-FETCHED COORDINATES DISPLAY */}
          <div className={`location-info mb-4 p-2 border rounded ${formData.lat ? 'bg-light' : 'bg-warning-light'}`}>
            <MDBIcon fas icon="map-marker-alt" className="text-danger me-2" />
            <span className="small fw-bold">
              {formData.lat 
                ? `Coordinates Locked: ${formData.lat.toFixed(4)}, ${formData.lon.toFixed(4)}` 
                : "Fetching GPS Coordinates... Ensure Location is Enabled."}
            </span>
          </div>

          <MDBBtn type="submit" color="success" block disabled={loading || !formData.lat}>
            {loading ? "Registering..." : "LIST UPCOMING CROP"}
          </MDBBtn>
        </form>
      </div>
    </div>
  );
};

export default AddUpcomingHarvest;