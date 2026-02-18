import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MDBContainer, MDBIcon, MDBNavbar, MDBTable, MDBTableHead, 
  MDBTableBody, MDBBtn, MDBCard, MDBCardBody 
} from 'mdb-react-ui-kit';

function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ethRate, setEthRate] = useState(0); // Store live ETH rate

  // Styling Constants
  const agriGreen = "#37c90b";
  const agriDark = "#153b0f"; 

  // Fetch data on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');

        // 1. Fetch live ETH rate in INR
        const rateRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
        setEthRate(rateRes.data.ethereum.inr);

        const res = await axios.get('http://localhost:5000/api/products/my-inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Remove this product from inventory?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f6f6f6", minHeight: '100vh' }}>
      <MDBNavbar dark style={{ backgroundColor: agriDark }}>
        <MDBContainer fluid className="px-4">
          <div onClick={() => navigate('/farmer-dashboard')} style={{ cursor: 'pointer' }}>
            <MDBIcon fas icon="arrow-left" className="text-white me-3" />
            <span className="text-white fw-bold">agriConnect | My Inventory</span>
          </div>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-5">
        <MDBCard className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
          <MDBCardBody className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Product Inventory</h4>
              <MDBBtn onClick={() => navigate('/add-crop')} style={{ backgroundColor: agriGreen }} className="shadow-0">
                <MDBIcon fas icon="plus" className="me-2" /> Add New Product
              </MDBBtn>
            </div>

            {loading ? (
              <div className="text-center py-5">Loading Inventory...</div>
            ) : (
              <MDBTable hover responsive align='middle' className="mb-0">
                <MDBTableHead className="bg-light text-uppercase small text-muted">
                  <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Total Qty</th>
                    <th>Price (INR)</th>
                    <th>Price (ETH)</th>
                    <th>Unsold</th>
                    <th>Sold</th>
                    <th>Actions</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {products.map((item) => {
                    const unsold = item.quantity - (item.soldQuantity || 0);
                    
                    // NEW: Calculate individual ETH price per item inside map
                    const currentEthPrice = ethRate > 0 
                      ? (item.priceInINR / ethRate).toFixed(6) 
                      : "---";
                    return (
                      <tr key={item._id}>
                        <td>
                          {/* Generates a Unique ID from the DB Object ID */}
                          <span className="fw-bold text-success">
                            CRP-{item._id.substring(item._id.length - 6).toUpperCase()}
                          </span>
                        </td>
                        <td>{item.cropName}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity} kg</td>
                        {/* Display stable INR price */}
                        <td className="fw-bold">₹{item.priceInINR}</td>
                        {/* Display dynamic ETH price */}
                        <td>
                           <span className="badge bg-info text-dark">
                             <MDBIcon fab icon="ethereum" className="me-1" />
                             {currentEthPrice} ETH
                           </span>
                        </td>
                        <td><span className="text-danger fw-bold">{unsold} kg</span></td>
                        <td><span className="text-success fw-bold">{item.soldQuantity || 0} kg</span></td>
                        <td>
                          <MDBBtn color="link" className="p-0 text-muted me-3"><MDBIcon fas icon="edit" /></MDBBtn>
                          <MDBBtn color="link" className="p-0 text-danger" onClick={() => handleDelete(item._id)}><MDBIcon fas icon="trash" /></MDBBtn>
                        </td>
                      </tr>
                    );
                  })}
                </MDBTableBody>
              </MDBTable>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-5 text-muted">No products found in your inventory.</div>
            )}
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  );
}

export default Inventory;