import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, 
  MDBIcon, MDBNavbar, MDBInputGroup, MDBBtn, MDBTable, MDBTableHead, MDBTableBody,
  MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem 
} from 'mdb-react-ui-kit';

// Charting Components
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import WeatherCard from './WeatherCard'; 

// Registering ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend
);

function FarmerDashboard() {
  const navigate = useNavigate(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ethRate, setEthRate] = useState(0);

  // Theme Colors
  const agrilight = "#37c90bff";
  const agriDark = "#153b0fff"; 
  const agriyellow = "#9eaa13ff"; 
  const lightGreyBg = "#f6f6f6";

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'farmer') {
      navigate('/farmerlogin');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch live ETH rate
      const rateRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
      setEthRate(rateRes.data.ethereum.inr);

      // Reusing your inventory route to calculate totals
      const res = await axios.get('http://localhost:5000/api/products/my-inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- REAL-TIME CALCULATIONS ---
  const totalSoldUnits = products.reduce((acc, p) => acc + (p.soldQuantity || 0), 0);
  const totalUnsoldUnits = products.reduce((acc, p) => acc + (p.quantity - (p.soldQuantity || 0)), 0);
  // Calculate total earnings in INR first, then convert to ETH
  const totalEarningsINR = products.reduce((acc, p) => acc + ((p.soldQuantity || 0) * p.priceInINR), 0);
  const totalEarningsETH = ethRate > 0 ? totalEarningsINR / ethRate : 0;

  // Weekly Analytic Graph Configuration
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      fill: true,
      label: 'Sold Products',
      data: [12, 19, 15, 25, 22, 30, totalSoldUnits], // Last point is real-time
      borderColor: agrilight,
      backgroundColor: 'rgba(55, 201, 11, 0.1)',
      tension: 0.4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    },
  };

  const ActionCard = ({ title, children, footerAction, footerClick, insightTitle, insightContent, menu }) => (
    <MDBCard className="h-100 shadow-sm border-1" style={{ borderRadius: '15px', borderTop: `5px solid ${agrilight}` }}>
      <MDBCardBody className="p-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{title}</h6>
          {menu ? menu : <MDBIcon fas icon="ellipsis-h" className="text-muted small" />}
        </div>
        <div className="flex-grow-1 mb-3">{children}</div>
        {insightTitle && (
          <div className="p-2 mb-2" style={{ border: '1px dashed #ccc', borderRadius: '10px', backgroundColor: '#fafafa' }}>
            <div className="d-flex align-items-center justify-content-center mb-1">
               <MDBIcon fas icon="leaf" size="xs" className="me-2" style={{ color: agrilight }} />
               <small className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>{insightTitle}</small>
            </div>
            <div className="text-center small">{insightContent}</div>
          </div>
        )}
        <div className="text-end mt-auto pt-2">
          <a href="#!" onClick={footerClick} className="text-decoration-none small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>
            <MDBIcon fas icon="sync-alt" className="me-1" size="xs" /> {footerAction || 'Update Now'}
          </a>
        </div>
      </MDBCardBody>
    </MDBCard>
  );


  return (
    <div style={{ backgroundColor: lightGreyBg, minHeight: '100vh', width: '100%', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- 1. TOP NAV BAR --- */}
      <MDBNavbar expand='lg' dark style={{ backgroundColor: agriDark, padding: '0.5rem 1rem' }}>
        <MDBContainer fluid>
          <div className="d-flex align-items-center">
            <MDBIcon fas icon="bars" className="text-white me-3" style={{ cursor: 'pointer' }} />
            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <span className="text-white fw-bold" style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                agri<span style={{ color: '#b9f319ff' }}>connect</span>
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center flex-grow-1 justify-content-center">
            <MDBInputGroup containerClass="w-50 mx-4" style={{ height: '35px' }}>
              <input className='form-control border-0' type='text' placeholder='Search marketplace...' style={{ fontSize: '0.9rem' }} />
              <MDBBtn style={{ backgroundColor: agriyellow, color: '#333', border: 'none' }} className="px-3 shadow-0">
                <MDBIcon fas icon="search" />
              </MDBBtn>
            </MDBInputGroup>
          </div>

          <div className="text-white d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
            {/* UPDATED: Notifications Dropdown */}
            <MDBDropdown group className="px-3">
              <MDBDropdownToggle tag='span' style={{ cursor: 'pointer' }} className="text-white fw-bold">
                <MDBIcon fas icon="bell" className="me-1" /> Notifications
              </MDBDropdownToggle>
              <MDBDropdownMenu style={{ minWidth: '280px', borderRadius: '10px' }}>
                <MDBDropdownItem className="p-3 border-bottom">
                  <div className="small fw-bold">New Sale!</div>
                  <div className="small text-muted">You sold 10kg of Organic Tomatoes.</div>
                </MDBDropdownItem>
                <MDBDropdownItem className="p-3 border-bottom text-center small text-primary py-2">
                  View All Notifications
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>

            {/* UPDATED: Help Page Link */}
            <span 
              className="px-3 fw-bold" 
              style={{ cursor: 'pointer' }} 
              onClick={() => navigate('/help')}>
              <MDBIcon fas icon="question-circle" className="me-1" /> Help
            </span>
          </div>
        </MDBContainer>
      </MDBNavbar>

      {/* --- 2. SUB-MENU BAR --- */}
      <div className="bg-white border-bottom mb-4 px-4 py-2 d-flex gap-4 small fw-bold text-muted shadow-sm align-items-center">
        <span onClick={() => navigate('/inventory')} style={{ cursor: 'pointer', color: agrilight }}>Inventory</span>
        <span onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>Orders</span>
        <span onClick={() => navigate('/growth')} style={{ cursor: 'pointer' }}>Growth</span>
      </div>

      <MDBContainer fluid className="px-4 pb-5">
        
        {/* --- 3. UPDATED METRIC STRIP (REAL DATA) --- */}
        <MDBRow className="mb-4 align-items-center">
          <MDBCol md="10">
            <div className="d-flex bg-white border shadow-sm rounded-3 w-100 overflow-hidden flex-wrap">
              {[
                { label: "Total Sold", val: `${totalSoldUnits} Units`, icon: "shopping-basket" },
                { label: "Unsold Items", val: `${totalUnsoldUnits} Units`, icon: "boxes" },
                { label: "Total Earnings", val: `Ξ ${totalEarningsETH.toFixed(4)}`, icon: "wallet" },
                { label: "Today's Sales", val: "Ξ 0.000", icon: "chart-line" },
                { label: "Wallet Balance", val: "2.45 ETH", icon: "coins" }
              ].map((m, i) => (
                <div key={i} className={`p-3 flex-grow-1 ${i < 4 ? 'border-end' : ''}`} style={{ borderTop: `4px solid ${agrilight}`, minWidth: '180px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{m.label}</small>
                    <MDBIcon fas icon={m.icon} size="xs" className="text-muted" />
                  </div>
                  <h5 className="mb-0 fw-bold" style={{ color: agriDark }}>{m.val}</h5>
                </div>
              ))}
            </div>
          </MDBCol>
          <MDBCol md="2" className="text-end">
             <MDBBtn onClick={() => navigate('/add-crop')} className="w-100 py-3 shadow-0" style={{ backgroundColor: agrilight, border: 'none', fontWeight: 'bold' }}>
               <MDBIcon fas icon="plus" className="me-2" /> Add Crop
             </MDBBtn>
          </MDBCol>
        </MDBRow>

        {/* --- 4. MAIN DASHBOARD GRID --- */}
        <MDBRow className="g-4 mb-4">
          <MDBCol md="8">
            <ActionCard title="Weekly Sold Analytics" footerAction="View Growth" footerClick={() => navigate('/growth')} insightTitle="Market Trend" insightContent="Demand for Grains is up 15%">
              <div className="d-flex justify-content-between align-items-end mb-2">
                 <h4 className="fw-bold mb-0">{totalSoldUnits} Units</h4>
                 <small className="text-success fw-bold">+12% from last week</small>
              </div>
              <div style={{ height: '180px' }}>
                 <Line data={chartData} options={chartOptions} />
              </div>
            </ActionCard>
          </MDBCol>
          <MDBCol md="4">
             <WeatherCard customColor={agrilight} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="g-4">
          {/* UPDATED: Inventory Preview Table */}
          <MDBCol md="8">
  <ActionCard 
    title="Inventory Management (Latest 5)" 
    footerAction="Manage Full Inventory"
    footerClick={() => navigate('/inventory')}
    menu={
      <MDBDropdown>
        <MDBDropdownToggle tag="a" className="text-muted shadow-0 p-0">
          <MDBIcon fas icon="ellipsis-h" />
        </MDBDropdownToggle>
        <MDBDropdownMenu>
          <MDBDropdownItem link onClick={() => navigate('/inventory')}>View All Inventory</MDBDropdownItem>
          <MDBDropdownItem link onClick={() => navigate('/add-crop')}>Add New Crop</MDBDropdownItem>
        </MDBDropdownMenu>
      </MDBDropdown>
    }
  >
    <MDBTable hover responsive small className="mt-2 mb-0">
      <MDBTableHead style={{ backgroundColor: '#f8f9fa' }}>
        <tr className="small text-muted text-uppercase">
          <th>Crop Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Price/Unit</th>
          <th>Status</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
        {/* The .slice(0, 5) ensures only the top 5 items from the array are shown */}
        {products.slice(0, 5).map((p) => {
        const inStock = p.quantity - (p.soldQuantity || 0);
        const currentEthPrice = ethRate > 0 ? (p.priceInINR / ethRate).toFixed(6) : "---";
          return (
            <tr key={p._id}>
              <td className="fw-bold">{p.cropName}</td>
              <td>{p.category}</td>
              <td>{inStock} kg</td>
              <td>
              <div className="small fw-bold">₹{p.priceInINR}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{currentEthPrice} ETH</div>
            </td>
              <td>
                <span className="badge" style={{
                  backgroundColor: inStock > 0 ? 'rgba(55,201,11,0.2)' : 'rgba(255,0,0,0.1)', 
                  color: inStock > 0 ? agrilight : 'red'
                }}>
                  {inStock > 0 ? 'In Stock' : 'Sold Out'}
                </span>
              </td>
            </tr>
          );
        })}
        {/* Fallback if inventory is empty */}
        {!loading && products.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center py-4 text-muted small">
              No crops found. Click "Add Crop" to get started.
            </td>
          </tr>
        )}
      </MDBTableBody>
    </MDBTable>
  </ActionCard>
</MDBCol>

          <MDBCol md="4">
            <ActionCard title="Recent Payments" footerAction="View All DeFi TX" insightTitle="Payment Status" insightContent="2 Pending Confirmation">
              <div className="text-center py-4 text-muted small">
                 Wallet connected. Monitoring Sepolia transactions...
              </div>
            </ActionCard>
          </MDBCol>
           {/* Farmer University Activated */}

          <MDBCol md="4">

            <ActionCard

              title="Tutorials & Resources"
              footerAction="Resume Lesson"
              footerClick={() => navigate('/view-video')}
            >
              <div className="position-relative mb-2">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=400" className="w-100 rounded border" style={{height: '100px', objectFit: 'cover'}} alt="edu"/>
                <div
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/view-video')}
                >
                  <MDBIcon fas icon="play-circle" size="3x" className="text-white opacity-75" />
                </div>
              </div>
              <MDBBtn
                className="w-100 shadow-0"
                style={{ backgroundColor: agrilight }}
                onClick={() => navigate('/view-video')}

              >

                Watch Video

              </MDBBtn>

            </ActionCard>

          </MDBCol>

        </MDBRow>

      </MDBContainer>
    </div>
  );
}

export default FarmerDashboard;