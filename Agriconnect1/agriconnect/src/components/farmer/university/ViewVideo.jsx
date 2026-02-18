import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBIcon, MDBNavbar, MDBBtn, MDBListGroup, MDBListGroupItem 
} from 'mdb-react-ui-kit';

// Import your local video file from the university folder
import tutorialVideo from './tutorial.mp4'; 

function ViewVideo() {
  const navigate = useNavigate();
  
  // Theme Colors
  const agrilight = "#37c90bff";
  const agriDark = "#153b0fff"; 
  const lightGreyBg = "#f6f6f6";

  const playlist = [
    { id: 1, title: "Blockchain Logistics 101", duration: "10:24", active: true },
    { id: 2, title: "Smart Contracts for Farmers", duration: "15:45", active: false },
    { id: 3, title: "Marketplace Bidding Strategies", duration: "08:12", active: false },
    { id: 4, title: "Maintaining Quality Standards", duration: "12:30", active: false }
  ];

  return (
    <div style={{ backgroundColor: lightGreyBg, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Top Navigation */}
      <MDBNavbar dark style={{ backgroundColor: agriDark, padding: '0.5rem 1rem' }}>
        <MDBContainer fluid>
          <div className="d-flex align-items-center" onClick={() => navigate('/farmer-dashboard')} style={{cursor: 'pointer'}}>
            <MDBIcon fas icon="arrow-left" className="text-white me-3" />
            <span className="text-white fw-bold">agri<span style={{ color: '#b9f319ff' }}>connect</span> | Farmer University</span>
          </div>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-4">
        <MDBRow>
          {/* Main Video Player Area */}
          <MDBCol lg="8" className="mb-4">
            <MDBCard className="shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
              
              {/* Local Video Player */}
              <div className="ratio ratio-16x9 bg-black">
                <video 
                  controls 
                  autoPlay 
                  className="w-100"
                  style={{ borderRadius: '15px 15px 0 0' }}
                >
                  <source src={tutorialVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <MDBCardBody className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: agriDark }}>How to use this website</h3>
                    
                  </div>
                  <MDBBtn outline color='success' size='sm' className='shadow-0'>
                    <MDBIcon fas icon="download" className='me-2' /> Resources
                  </MDBBtn>
                </div>
                <hr />
                <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  In this lesson, we explore how this website works for farmers to sell thier products and track thier productivity.
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Sidebar: Next Lessons */}
          <MDBCol lg="4">
            <MDBCard className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <MDBCardBody className="p-0">
                
                
                <div className="p-3">
                  <MDBBtn 
                    className="w-100 shadow-0" 
                    style={{ backgroundColor: agriDark }}
                    onClick={() => navigate('/farmer-dashboard')}
                  >
                    Back to Dashboard
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default ViewVideo;