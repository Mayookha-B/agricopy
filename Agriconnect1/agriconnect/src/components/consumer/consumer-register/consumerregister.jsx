import React, { useState } from 'react';
import { MDBCol, MDBRow, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import consumerImg from './loginimg.jpg'; 

function ConsumerRegister() {
  const myCustomColor = "#48aa0b";
  const navigate = useNavigate();

  // 1. Initialize state to capture form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    metamaskId: '',
    phoneNumber: '',
    dob: '',
    address: '',
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
      // Sends data to the route you just created in backend
      const response = await axios.post('http://localhost:5000/api/consumer/register', formData);
      alert(response.data.message);
      navigate('/consumer-login'); // Redirect to login page
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="vh-100 vw-100 m-0 p-0" style={{ overflowX: 'hidden' }}>
      <MDBRow className="w-100 g-0 m-0">
        
        {/* Left Column: Fixed Image */}
        <MDBCol md='6' className="d-none d-md-block p-0">
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '50%',
            height: '100vh',
            zIndex: 1
          }}>
            <img 
              src={consumerImg}
              alt="Consumer illustration" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </MDBCol>

        {/* Right Column: Consumer Form */}
        <MDBCol 
          md='6' 
          className="ms-auto bg-white d-flex flex-column align-items-center py-5" 
          style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}
        >
          <form style={{ width: '90%', maxWidth: '550px', padding: '20px' }} onSubmit={handleRegister}>
            
            <h2 className="fw-bold mb-4" style={{ color: myCustomColor }}>Consumer Registration</h2>
            <p className="text-muted mb-4">Join the ecosystem to buy fresh produce directly from farmers.</p>

            <MDBRow>
              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' label='Full Name' name='fullName' type='text' size="lg" onChange={handleChange} required />
              </MDBCol>
              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' label='Email address' name='email' type='email' size="lg" onChange={handleChange} required />
              </MDBCol>
            </MDBRow>

            <MDBInput 
              wrapperClass='mb-4' 
              label='MetaMask Public ID (0x...)' 
              name='metamaskId' 
              type='text' 
              size="lg"
              placeholder="0x..."
              onChange={handleChange}
              required
            />

            <MDBRow>
              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' label='Phone Number' name='phoneNumber' type='tel' size="lg" onChange={handleChange} required />
              </MDBCol>
              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' label='Date of Birth' name='dob' type='date' size="lg" onChange={handleChange} required />
              </MDBCol>
            </MDBRow>

            <MDBInput wrapperClass='mb-4' label='Delivery Address' name='address' type='text' size="lg" onChange={handleChange} required />

            <MDBInput wrapperClass='mb-4' label='Set Password' name='password' type='password' size="lg" onChange={handleChange} required />

            <div className='text-center text-md-start mt-4 pt-2'>
              <MDBBtn type="submit" className="w-100 mb-3" size='lg' style={{ backgroundColor: myCustomColor, border: 'none' }}>
                CREATE CONSUMER ACCOUNT
              </MDBBtn>
              <p className="small fw-bold mt-2">
                Already have an account? <a href="/consumer-login" className="link-danger">Login</a>
              </p>
            </div>

          </form>
        </MDBCol>
      </MDBRow>
    </div>
  );
}

export default ConsumerRegister;