import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import navigate hook
import { MDBCol, MDBRow, MDBBtn, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import loginimg from './loginimg.jpg';

function Consumerlog() {
  
  const myCustomColor = "#48aa0b";

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/consumer/login', { email, password });
      
      // Store credentials
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'consumer');
      
      alert(res.data.message);
      navigate('/consumer-page'); 
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="d-flex flex-column vh-100 vw-100 m-0 p-0" style={{ overflowX: 'hidden' }}>
      
      <div className="flex-grow-1 d-flex">
        <MDBRow className="w-100 g-0 m-0 h-100">
          
          {/* Left Column: Image Section */}
          <MDBCol md='6' className="d-none d-md-block p-0">
            <img 
              src={loginimg}
              alt="Login illustration" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </MDBCol>

          {/* Right Column: Form Section */}
          <MDBCol md='6' className="d-flex flex-column justify-content-center align-items-center bg-white py-5" >

            <div style={{ width: '90%', maxWidth: '700px', padding: '0 30px' }}>
              <p className="lead fw-normal mb-0 me-3">Sign in</p>
              
              <div className="d-flex align-items-center my-4">
                <div style={{ flex: 1, height: '2px', backgroundColor: '#eee' }}></div>
              </div>

              <form onSubmit={handleLogin}> {/* Wrap in form for accessibility */}
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Email address' 
                  id='emailInput' 
                  type='email' 
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Changed from handleChange
  required
                />
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Password' 
                  id='passInput' 
                  type='password' 
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Changed from handleChange
  required
                />

                <div className="d-flex justify-content-between mb-4">
                  <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                  <a href="#!" style={{ color: myCustomColor }}>Forgot password?</a>
                </div>

                <div className='text-center text-md-start mt-4 pt-2'>
                  <MDBBtn 
                    type="submit" // Change to submit
                    className="mb-0 px-5" 
                    size='lg' 
                    style={{ backgroundColor: myCustomColor, border: 'none' }}
                  >
                    LOGIN
                  </MDBBtn>
                  
                  <p className="small fw-bold mt-2 pt-1 mb-2">
                    Don't have an account? <a href="/consumerregister" className="link-danger">Register</a>
                  </p>
                </div>
              </form>
            </div>
          </MDBCol>

        </MDBRow>
      </div>
    </div>
  );
}

export default Consumerlog;