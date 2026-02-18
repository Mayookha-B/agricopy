import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBIcon, MDBNavbar, MDBBtn, MDBInput, MDBTextArea 
} from 'mdb-react-ui-kit';

function AddCrop() {
  const navigate = useNavigate();
  const agriGreen = "#37c90b"; 
  const navBg = "#153b0f"; 
  
  

  const [formValue, setFormValue] = useState({
    cropName: '',
    harvestDate: '',
    expiryDate: '',
    manualAddress: '',
    quantity: '',
    priceInINR: '', // Changed from price to priceInINR
    category: 'Grains'
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [isLocating, setIsLocating] = useState(false);
  const [ethRate, setEthRate] = useState(0); // Store ETH price in INR

  // --- FETCH ETH RATE ON MOUNT ---
  useEffect(() => {
    const fetchEthRate = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
        setEthRate(res.data.ethereum.inr);
      } catch (err) {
        console.error("Error fetching ETH rate", err);
      }
    };
    fetchEthRate();
  }, []);
  
  const onChange = (e) => {
    setFormValue({ ...formValue, [e.target.name]: e.target.value });
  };

  // --- NEW: IMAGE UPLOAD HANDLER ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store file for backend/IPFS upload
      setPreview(URL.createObjectURL(file)); // Create preview URL
    }
  };

  // --- NEW: SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coords.lat || !coords.lon) {
      alert("Please detect GPS location or verify address before submitting.");
      return;
    }

    // 1. Create FormData for file upload
    const data = new FormData();
    const farmerId = localStorage.getItem('userId');
    data.append('farmerId', farmerId);
    data.append('cropName', formValue.cropName);
    data.append('category', formValue.category);
    data.append('harvestDate', formValue.harvestDate);
    data.append('expiryDate', formValue.expiryDate);
    data.append('quantity', formValue.quantity);
    data.append('priceInINR', formValue.priceInINR); // Send priceInINR to backend
    data.append('manualAddress', formValue.manualAddress);
    data.append('lat', coords.lat);
    data.append('lon', coords.lon);
    
    // Append the image file
    if (imageFile) {
      data.append('image', imageFile);
    }

    // 2. Get Token for Authorization
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('http://localhost:5000/api/products/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Pass JWT for security
        }
      });

      if (res.data.success) {
        alert("Crop Listing Added Successfully!");
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting listing");
    }
  };


  // --- LOCATION LOGIC ---

  // --- FEATURE 1: GET CURRENT GPS LOCATION ---
  const getCurrentGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          
          try {
            // FIXED: Added backticks for the URL
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            setFormValue(prev => ({ ...prev, manualAddress: res.data.display_name }));
          } catch (err) {
            // FIXED: Added backticks for the fallback string
            setFormValue(prev => ({ ...prev, manualAddress: `Lat: ${latitude}, Lon: ${longitude}` }));
          }
          setIsLocating(false);
        },
        () => {
          alert("GPS Access Denied. Please allow location permissions.");
          setIsLocating(false);
        }
      );
    }
  };

  // --- FEATURE 2: GEOCODE MANUAL ADDRESS (On Blur) ---
  const handleAddressSearch = async () => {
    if (!formValue.manualAddress) return;
    setIsLocating(true);
    try {
      // FIXED: Added backticks for the URL
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formValue.manualAddress)}`);
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        setFormValue(prev => ({ ...prev, manualAddress: display_name })); 
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
    setIsLocating(false);
  };

  

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: '100vh' }}>
      <MDBNavbar dark style={{ backgroundColor: navBg }}>
        <MDBContainer fluid className="px-4">
           <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
             <MDBIcon fas icon="arrow-left" className="text-white me-3" />
             <span className="text-white fw-bold">agriconnect | Add Listing</span>
           </div>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol md="10">
            <MDBCard className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <MDBCardBody className="p-5">
                <h3 className="fw-bold mb-4">Add New Crop Listing</h3>
                
                <form onSubmit={handleSubmit}>
                  <MDBRow className="g-4">
                    {/* Basic Details */}
                    <MDBCol md="6">
                      <MDBInput label="Crop Name" name='cropName' onChange={onChange} required />
                    </MDBCol>
                    <MDBCol md="6">
                      <select className="form-select" name="category" onChange={onChange}>
                        <option value="Grains">Grains</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                      </select>
                    </MDBCol>

                    {/* Freshness Details */}
                    <MDBCol md="6">
                      <label className="small fw-bold text-muted mb-1">Harvest Date</label>
                      <MDBInput type="date" name="harvestDate" onChange={onChange} required />
                    </MDBCol>
                    <MDBCol md="6">
                      <label className="small fw-bold text-muted mb-1">Expiry Date</label>
                      <MDBInput type="date" name="expiryDate" onChange={onChange} required min={formValue.harvestDate} />
                    </MDBCol>

                    {/* --- IMAGE UPLOAD PROVISION --- */}
                    <MDBCol md="12">
                      <label className="small fw-bold text-muted mb-2 d-block">Produce Image</label>
                      <div className="text-center p-4 rounded-3 bg-light" style={{ border: '2px dashed #ced4da', minHeight: '200px' }}>
                        <input type="file" id="cropImg" hidden onChange={handleImageChange} accept="image/*" />
                        <label htmlFor="cropImg" style={{ cursor: 'pointer', width: '100%' }}>
                          {preview ? (
                            <img src={preview} alt="Preview" style={{ maxHeight: '250px', borderRadius: '8px' }} />
                          ) : (
                            <div className="py-4">
                               <MDBIcon fas icon="cloud-upload-alt" size="3x" className="text-muted mb-2" />
                               <p className="text-muted small mb-0">Click to upload produce photo</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </MDBCol>


                     {/* Location Section */}
                    <MDBCol md="12">
                      <div className="d-flex justify-content-between align-items-end mb-1">
                        <label className="small fw-bold text-muted">Crop Location (Manual or GPS)</label>
                        <MDBBtn size="sm" color="success" outline onClick={getCurrentGPS} disabled={isLocating}>
                          <MDBIcon fas icon="location-arrow" /> {isLocating ? "Detecting..." : "Use Current GPS"}
                        </MDBBtn>
                      </div>
                      <MDBTextArea 
                        name='manualAddress' 
                        value={formValue.manualAddress} 
                        onChange={onChange} 
                        onBlur={handleAddressSearch} // This verifies the address when user clicks away
                        rows={3}
                        placeholder="Type address or use the GPS button above"
                      />
                      {coords.lat && (
                        <div className="mt-2 small text-success fw-bold">
                          <MDBIcon fas icon="check-circle" /> Geo-Coordinates Verified: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
                        </div>
                      )}
                    </MDBCol>


                    {/* Quantity and Price Section */}

                  <MDBCol md="6">
                    <label className="small fw-bold text-muted mb-1">Total Quantity (kg/units)</label>
                      <MDBInput 
                        type="number" 
                        name='quantity' 
                        value={formValue.quantity} 
                        onChange={onChange} 
                        required 
                       placeholder="e.g. 50" 
                      />
                  </MDBCol>
                  <MDBCol md="6">
                      <label className="small fw-bold text-muted mb-1">Price (₹ per unit)</label>
                      <MDBInput 
                        type="number" 
                        name='priceInINR' 
                        value={formValue.priceInINR} 
                        onChange={onChange} 
                        required 
                        placeholder="e.g. 500" 
                      />
                      {/* DYNAMIC ETH CONVERSION PREVIEW */}
                      {formValue.priceInINR > 0 && ethRate > 0 && (
                        <div className="mt-1">
                          <span className="badge bg-info text-dark" style={{fontSize: '0.75rem'}}>
                            <MDBIcon fab icon="ethereum" /> Approx: {(formValue.priceInINR / ethRate).toFixed(6)} ETH
                          </span>
                        </div>
                      )}
                    </MDBCol>


                    {/* Submit Section */}
                    <MDBCol md="12" className="d-flex justify-content-end align-items-center mt-5 border-top pt-4">
                      <MDBBtn color='link' className='text-muted fw-bold me-4 shadow-0' onClick={() => navigate(-1)}>CANCEL</MDBBtn>
                      <MDBBtn className='px-5 fw-bold shadow-0' style={{ backgroundColor: agriGreen, borderRadius: '8px' }}>
                        SUBMIT LISTING
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default AddCrop;