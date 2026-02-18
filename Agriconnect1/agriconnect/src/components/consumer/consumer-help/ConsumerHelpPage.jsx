import React, { useState, useEffect } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBInput, MDBBtn, MDBTextArea, MDBIcon } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ConsumerHelpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ consumerId: '', dispute: '' });
  const [status, setStatus] = useState('');

  // UI Colors (Adjust these to match your consumer-side branding)
  const consumerPrimary = "#007bff"; // A standard blue for consumers
  const consumerDark = "#002d62";

  // --- AUTO-FETCH CONSUMER ID FROM TOKEN ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const payload = JSON.parse(window.atob(base64Url));
        
        // Ensure this matches the key name in your JWT payload for Consumers
        // Usually something like 'consumerCustomId' or 'userId'
        setFormData(prev => ({ ...prev, consumerId: payload.consumerCustomId || payload.userId || '' }));
      } catch (err) {
        console.error("Token decode error", err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting ticket...');
    
    try {
      // Points to your backend route (ensure backend handles consumer disputes)
      const response = await axios.post('http://localhost:5000/api/disputes', {
        userId: formData.consumerId,
        userType: 'consumer',
        farmerId: formData.consumerId,
        dispute: formData.dispute
      });
      
      if (response.data.success) {
        setStatus(`Support ticket ${response.data.complaintId} created successfully!`);
        setFormData(prev => ({ ...prev, dispute: '' })); 
      }
    } catch (err) {
      console.error(err);
      setStatus('Error submitting request. Please try again later.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
      <MDBContainer>
        <MDBBtn color='none' className='text-dark mb-4 shadow-0' onClick={() => navigate(-1)}>
          <MDBIcon fas icon="arrow-left" /> Back to Profile
        </MDBBtn>

        <MDBCard className="shadow-sm mx-auto" style={{ maxWidth: '600px', borderRadius: '15px', borderTop: `5px solid ${consumerPrimary}` }}>
          <MDBCardBody className="p-4">
            <div className="text-center mb-4">
              <MDBIcon fas icon="headset" size="3x" style={{ color: consumerPrimary }} />
              <h3 className="fw-bold mt-2" style={{ color: consumerDark }}>Customer Support</h3>
              <p className="text-muted small">Need help with an order? Tell us what's wrong.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label small fw-bold">Customer ID</label>
                <MDBInput 
                  type="text" 
                  value={formData.consumerId}
                  readOnly 
                  className="bg-light"
                  style={{ cursor: 'not-allowed' }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Issue Description</label>
                <MDBTextArea 
                  rows={5} 
                  placeholder="Tell us about issues with delivery, product quality, or payments..."
                  value={formData.dispute}
                  onChange={(e) => setFormData({...formData, dispute: e.target.value})}
                  required 
                />
              </div>

              <MDBBtn block style={{ backgroundColor: consumerPrimary, fontWeight: 'bold' }} type="submit">
                Submit Support Request
              </MDBBtn>

              {status && (
                <div 
                  className={`text-center mt-3 p-2 rounded small ${
                    status.includes('Error') ? 'text-danger' : 'text-success'
                  }`}
                  style={{ backgroundColor: status.includes('Error') ? '#f8d7da' : '#d4edda' }}
                >
                  {status}
                </div>
              )}
            </form>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  );
}

export default ConsumerHelpPage;