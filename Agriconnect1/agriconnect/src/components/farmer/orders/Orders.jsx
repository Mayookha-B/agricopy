import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBIcon, MDBNavbar, MDBBtnGroup, MDBBtn, MDBTable, 
  MDBTableHead, MDBTableBody, MDBBadge 
} from 'mdb-react-ui-kit';

function Orders() {
  const navigate = useNavigate();
  const [view, setView] = useState('active'); // 'active' or 'delivered'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme Colors
  const agrilight = "#37c90bff";
  const agriDark = "#153b0fff"; 
  const lightGreyBg = "#f6f6f6";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add this inside your Orders component in Orders.jsx
const handleCompleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:5000/api/orders/complete/${orderId}`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Refresh the list locally
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Delivered' } : o));
    alert("Order marked as Delivered!");
  } catch (err) {
    console.error("Failed to complete order", err);
  }
};

  // Logic: Filter based on the selected button
  const filteredOrders = orders.filter(order => {
    if (view === 'active') return order.status !== 'Delivered';
    return order.status === 'Delivered';
  });

  return (
    <div style={{ backgroundColor: lightGreyBg, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Navbar */}
      <MDBNavbar dark style={{ backgroundColor: agriDark, padding: '0.5rem 1rem' }}>
        <MDBContainer fluid>
          <div className="d-flex align-items-center" onClick={() => navigate('/farmer-dashboard')} style={{cursor: 'pointer'}}>
            <MDBIcon fas icon="arrow-left" className="text-white me-3" />
            <span className="text-white fw-bold">agriConnect | Order Management</span>
          </div>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol md="11">
            <MDBCard className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <MDBCardBody className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: agriDark }}>
                      {view === 'active' ? 'Current Orders' : 'Delivery History'}
                    </h4>
                    <p className="text-muted small">
                      {view === 'active' 
                        ? 'Manage incoming requests and active shipments' 
                        : 'Review your completed successful deliveries'}
                    </p>
                  </div>
                  
                  {/* View Toggles - Styled like the Growth Page */}
                  <MDBBtnGroup shadow='0'>
                    <MDBBtn 
                      color='light' 
                      active={view === 'active'} 
                      onClick={() => setView('active')}
                      style={view === 'active' ? { backgroundColor: agrilight, color: 'white' } : {}}
                    >
                      Active
                    </MDBBtn>
                    <MDBBtn 
                      color='light' 
                      active={view === 'delivered'} 
                      onClick={() => setView('delivered')}
                      style={view === 'delivered' ? { backgroundColor: agrilight, color: 'white' } : {}}
                    >
                      Delivered
                    </MDBBtn>
                  </MDBBtnGroup>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status"></div>
                  </div>
                ) : (
                  <MDBTable hover responsive align='middle' className="mb-0">
                    <MDBTableHead className="bg-light">
                      <tr className="small text-muted text-uppercase">
                        <th>Order ID</th>
                        <th>Crop Name</th>
                        <th>Customer</th>
                        <th>Quantity</th>
                        <th>Total (INR)</th>
                        <th>Status</th>
                        {view === 'active' && <th>Action</th>}
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="fw-bold text-primary">
                              ORD-{order._id.substring(order._id.length - 5).toUpperCase()}
                            </span>
                          </td>
                          <td>{order.productId?.cropName || "Unknown Crop"}</td>
                          <td>{order.consumerId?.fullName || "Anonymous"}</td>
                          <td>{order.quantity} kg</td>
                          <td className="fw-bold text-success">Ξ {order.totalPrice.toFixed(4)}</td>
                          <td>
                            <MDBBadge 
                              color={order.status === 'Delivered' ? 'success' : 'warning'} 
                              light 
                              className="px-3 py-2"
                            >
                              {order.status}
                            </MDBBadge>
                          </td>
                          {view === 'active' && (
                            <td>
                              <MDBBtn size="sm" color="success" className="shadow-0 py-2" onClick={() => handleCompleteOrder(order._id)}>
                                Complete
                              </MDBBtn>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={view === 'active' ? 7 : 6} className="text-center py-5 text-muted">
                            No {view} orders found.
                          </td>
                        </tr>
                      )}
                    </MDBTableBody>
                  </MDBTable>
                )}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default Orders;