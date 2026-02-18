import React, { useState } from 'react';
import { MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import loginimg from './loginimg.jpg'; 

function Farmerlog() {
  const myCustomColor = "#48aa0b"; // Updated to a cleaner green hex

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/farmer/login', { email, password });
      
      // Store the token and farmer info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'farmer');
      
      alert(res.data.message);
      navigate('/farmer-dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (

    <div className="d-flex flex-column vh-100 vw-100 m-0 p-0" style={{ overflowX: 'hidden' }}>
      <div className="flex-grow-1 d-flex">
        <MDBRow className="w-100 g-0 m-0 h-100">
          <MDBCol md='6' className="d-none d-md-block p-0">
            <img src={loginimg} alt="Login" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </MDBCol>

          <MDBCol md='6' className="d-flex flex-column justify-content-center align-items-center bg-white py-5">
            <form style={{ width: '90%', maxWidth: '700px', padding: '0 30px' }} onSubmit={handleLogin}>
              <p className="lead fw-normal mb-4">Sign in (Farmer)</p>
              
              <MDBInput 
                wrapperClass='mb-4' 
                label='Email address' 
                type='email' 
                size="lg" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <MDBInput 
                wrapperClass='mb-4' 
                label='Password' 
                type='password' 
                size="lg" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />

              <div className='text-center text-md-start mt-4 pt-2'>
                <MDBBtn type="submit" className="mb-0 px-5" size='lg' style={{ backgroundColor: myCustomColor, border: 'none' }}>
                  LOGIN
                </MDBBtn>
                <p className="small fw-bold mt-2 pt-1">
                  Don't have an account? <a href="/farmer-register" className="link-danger">Register</a>
                </p>
              </div>
            </form>
          </MDBCol>
        </MDBRow>
      </div>
    </div>
    // /* Use vh-100 to ensure the container is exactly the height of the screen */
    // <div className="d-flex flex-column vh-100 vw-100 m-0 p-0" style={{ overflowX: 'hidden' }}>
      
    //   {/* Main Content: flex-grow-1 fills the space between top and footer */}
    //   <div className="flex-grow-1 d-flex">
    //     {/* Added h-100 to the row so it stretches vertically */}
    //     <MDBRow className="w-100 g-0 m-0 h-100">
          
    //       {/* Left Column: Image Section */}
    //       <MDBCol md='6' className="d-none d-md-block p-0">
    //         <img 
    //           src={loginimg}
    //           alt="Login illustration" 
    //           style={{ 
    //             width: '100%', 
    //             height: '100%', 
    //             objectFit: 'cover', // This ensures the image fills the side without gaps
    //             display: 'block'
    //           }}
    //         />
    //       </MDBCol>

    //       {/* Right Column: Form Section */}
    //       <MDBCol md='6' className="d-flex flex-column justify-content-center align-items-center bg-white py-5" >

    //         <div style={{ width: '90%', maxWidth: '700px', padding: '0 30px' }}>
    //             <p className="lead fw-normal mb-0 me-3" >Sign in </p>
    //             <div className="d-flex align-items-center my-4">
    //                 <div style={{ flex: 1, height: '2px', backgroundColor: '#eee' }}></div>
    //             </div>
                
              
    //           {/*<div className="d-flex flex-row align-items-center justify-content-center justify-content-md-start">
    //             <p className="lead fw-normal mb-0 me-3">Sign in with</p>
    //             <MDBBtn floating size='md' tag='a' className='me-2' style={{ backgroundColor: myCustomColor, border: 'none' }}>
    //               <MDBIcon fab icon='facebook-f' />
    //             </MDBBtn>
    //             <MDBBtn floating size='md' tag='a' className='me-2' style={{ backgroundColor: myCustomColor, border: 'none' }}>
    //               <MDBIcon fab icon='twitter' />
    //             </MDBBtn>
    //             <MDBBtn floating size='md' tag='a' className='me-2' style={{ backgroundColor: myCustomColor, border: 'none' }}>
    //               <MDBIcon fab icon='linkedin-in' />
    //             </MDBBtn>
    //           </div>

    //           <div className="d-flex align-items-center my-4">
    //              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
    //              <p className="text-center fw-bold mx-3 mb-0 text-muted">Or</p>
    //              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
    //           </div>*/}

    //           <MDBInput wrapperClass='mb-4' label='Email address' id='emailInput' type='email' size="lg"/>
    //           <MDBInput wrapperClass='mb-4' label='Password' id='passInput' type='password' size="lg"/>

    //           <div className="d-flex justify-content-between mb-4">
    //             <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
    //             <a href="#!" style={{ color: myCustomColor }}>Forgot password?</a>
    //           </div>

    //           <div className='text-center text-md-start mt-4 pt-2'>
    //             <a href="/farmer-dashboard" className="text-white text-decoration-none">
    //             <MDBBtn className="mb-0 px-5" size='lg' style={{ backgroundColor: myCustomColor, border: 'none' }}>
    //             LOGIN
    //             </MDBBtn></a>
    //             <p className="small fw-bold mt-2 pt-1 mb-2">
    //               Don't have an account? <a href="/farmer-register" className="link-danger">Register</a>
    //             </p>
    //           </div>
    //         </div>
    //       </MDBCol>

    //     </MDBRow>
    //   </div>

    //   {/* Footer 
    //   <div 
    //     className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 w-100 m-0"
    //     style={{ backgroundColor: myCustomColor }} 
    //   >
    //     <div className="text-white mb-3 mb-md-0">
    //       Copyright © 2025. All rights reserved.
    //     </div>
    //     <div>
    //       <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
    //         <MDBIcon fab icon='facebook-f' size="md"/>
    //       </MDBBtn>
    //       <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
    //         <MDBIcon fab icon='twitter' size="md"/>
    //       </MDBBtn>
    //       <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
    //         <MDBIcon fab icon='google' size="md"/>
    //       </MDBBtn>
    //       <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
    //         <MDBIcon fab icon='linkedin-in' size="md"/>
    //       </MDBBtn>
    //     </div>
    //   </div>*/}
    // </div>
  );
}

export default Farmerlog;