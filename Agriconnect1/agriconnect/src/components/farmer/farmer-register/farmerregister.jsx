import React, { useState } from 'react';
import { MDBCol, MDBRow, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import axios from 'axios'; // Import axios for API calls
import { useNavigate } from 'react-router-dom';
import regimg from './loginimg.jpg';

function FarmerRegister() {
  const myCustomColor = "#48aa0b";
  const navigate = useNavigate();

  // 1. Initialize state for all form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    metamaskId: '',
    phoneNumber: '',
    dob: '',
    address: '',
    licenseNumber: '',
    organizationName: '',
    password: ''
  });

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/farmer/register', formData);
      alert(response.data.message);
      navigate('/farmerlogin'); // Redirect to login on success
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 vw-100 m-0 p-0" style={{ overflowX: 'hidden' }}>
      <div className="flex-grow-1 d-flex">
        <MDBRow className="w-100 g-0 m-0">
          <MDBCol md='5' className="d-none d-md-block p-0">
            <img src={regimg} alt="Register" style={{ width: '50%', height: '100%', objectFit: 'cover', position: 'fixed' }} />
          </MDBCol>

          <MDBCol md='7' className="d-flex flex-column justify-content-center align-items-center bg-white py-5">
            <form style={{ width: '90%', maxWidth: '600px', padding: '20px' }} onSubmit={handleRegister}>
              <h2 className="fw-bold mb-4" style={{ color: myCustomColor }}>Farmer Registration</h2>
              <p className="text-muted mb-4">Create your account to join the DeFi marketplace.</p>

              <MDBRow>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='Full Name' name='fullName' type='text' size="lg" onChange={handleChange} required />
                </MDBCol>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='Email address' name='email' type='email' size="lg" onChange={handleChange} required />
                </MDBCol>
              </MDBRow>

              <MDBInput wrapperClass='mb-4' label='MetaMask Public ID (0x...)' name='metamaskId' type='text' size="lg" placeholder="0x..." onChange={handleChange} required />

              <MDBRow>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='Phone Number' name='phoneNumber' type='tel' size="lg" onChange={handleChange} required />
                </MDBCol>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='Date of Birth' name='dob' type='date' size="lg" onChange={handleChange} required />
                </MDBCol>
              </MDBRow>

              <MDBInput wrapperClass='mb-4' label='Address' name='address' type='text' size="lg" onChange={handleChange} required />

              <MDBRow>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='License Number' name='licenseNumber' type='text' size="lg" onChange={handleChange} required />
                </MDBCol>
                <MDBCol md='6'>
                  <MDBInput wrapperClass='mb-4' label='Organization Name' name='organizationName' type='text' size="lg" onChange={handleChange} />
                </MDBCol>
              </MDBRow>

              <MDBInput wrapperClass='mb-4' label='Password' name='password' type='password' size="lg" onChange={handleChange} required />

              <div className='text-center text-md-start mt-4 pt-2'>
                <MDBBtn type="submit" className="w-100 mb-3" size='lg' style={{ backgroundColor: myCustomColor, border: 'none' }}>
                  REGISTER
                </MDBBtn>
                <p className="small fw-bold mt-2">
                  Already have an account? <a href="/farmerlogin" className="link-danger">Login</a>
                </p>
              </div>
            </form>
          </MDBCol>
        </MDBRow>
      </div>
    </div>
  );
}

export default FarmerRegister;