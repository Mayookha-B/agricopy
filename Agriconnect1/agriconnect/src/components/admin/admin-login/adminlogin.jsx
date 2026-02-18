import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigate hook
import { MDBCol, MDBRow, MDBBtn, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import loginimg from './loginimg.jpg';

function Adminlog() {
  const navigate = useNavigate(); // Initialize navigation
  const myCustomColor = "#48aa0b";

  // State to hold input values
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.type === 'email' ? 'email' : 'password']: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Basic logic: if fields aren't empty, navigate to consumer page
    if (credentials.email && credentials.password) {
      navigate('/admin-dashboard');
    } else {
      alert("Please enter both email and password");
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
                  value={credentials.email}
                  onChange={handleChange}
                />
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Password' 
                  id='passInput' 
                  type='password' 
                  size="lg"
                  value={credentials.password}
                  onChange={handleChange}
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
                  
                </div>
              </form>
            </div>
          </MDBCol>

        </MDBRow>
      </div>
    </div>
  );
}

export default Adminlog;