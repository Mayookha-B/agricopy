import React, { useState, useEffect } from 'react';
import { Search, Menu, CheckCircle, Clock, Edit2, Check, X, Users, User } from 'lucide-react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('farmer'); // New: State to toggle between 'farmer' and 'consumer'
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/disputes/all');
      setComplaints(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- Filter Logic ---
  // Filters the complaints array based on the ID prefix (F- or C-)
  const filteredComplaints = complaints.filter(item => {
    // 1. Filter by Tab (Stakeholder Type)
    const matchesTab = activeTab === 'farmer' 
      ? item.farmerId.startsWith('F-') 
      : item.farmerId.startsWith('C-');

    // 2. Filter by Status
    const matchesStatus = statusFilter === 'All' 
      ? true 
      : item.status === statusFilter;

    return matchesTab && matchesStatus;
  });

  const saveRemarks = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/disputes/update/${id}`, {
        remarks: tempRemarks
      });
      setComplaints(prev =>
        prev.map(item => (item._id === id ? { ...item, remarks: tempRemarks } : item))
      );
      setEditingId(null);
    } catch (err) {
      alert("Failed to update remarks");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/disputes/update/${id}`, {
        status: newStatus
      });
      setComplaints(prev =>
        prev.map(item => (item._id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const startEditing = (id, currentRemarks) => {
    setEditingId(id);
    setTempRemarks(currentRemarks);
  };

  return (
    <div className="agri-admin-wrapper">
      <header className="agri-topbar">
        <div className="topbar-left">
          <Menu className="menu-icon" />
          <div className="logo-section">
            <span className="logo-text">agri<span className="logo-accent">connect</span></span>
          </div>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search complaints" className="nav-search" />
          <button className="search-btn"><Search size={18} color="white" /></button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-header-flex">
          <h2 className="page-heading">Complaints Management</h2>
          
          <div className="filter-group"> {/* NEW: Container for both filters */}
            {/* Status Filter Dropdown */}
            <div className="status-filter-container">
              <span className="filter-label">Status:</span>
              <select 
                className="status-main-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending Only</option>
                <option value="Resolved">Resolved Only</option>
              </select>
            </div>
          {/* --- TAB TOGGLE SECTION --- */}
          <div className="admin-tabs">
            <button 
              className={`tab-item ${activeTab === 'farmer' ? 'active' : ''}`}
              onClick={() => setActiveTab('farmer')}
            >
              <Users size={16} /> Farmer List
            </button>
            <button 
              className={`tab-item ${activeTab === 'consumer' ? 'active' : ''}`}
              onClick={() => setActiveTab('consumer')}
            >
              <User size={16} /> Consumer List
            </button>
          </div>
        </div>
      </div>
        {loading ? (
          <p className="loading-text">Loading complaints...</p>
        ) : (
          <div className="table-container">
            <table className="agri-table">
              <thead>
                <tr>
                  <th>COMPLAINT ID</th>
                  <th>COMPLAINTS</th>
                  <th>{activeTab === 'farmer' ? 'FARMER ID' : 'CONSUMER ID'}</th>
                  <th>REMARKS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((item) => (
                    <tr key={item._id}>
                      <td className="sl-no">{item.complaintId}</td>
                      <td className="complaint-text">{item.complaint}</td>
                      <td><span className="user-id">{item.farmerId}</span></td>
                      <td className="remarks-cell">
                        {editingId === item._id ? (
                          <div className="edit-mode">
                            <input 
                              type="text" 
                              value={tempRemarks} 
                              onChange={(e) => setTempRemarks(e.target.value)}
                              className="remarks-input"
                            />
                            <button onClick={() => saveRemarks(item._id)} className="action-icon save"><Check size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="action-icon cancel"><X size={16}/></button>
                          </div>
                        ) : (
                          <div className="view-mode">
                            <span className={item.remarks !== "No remarks yet." ? "remarks-val" : "remarks-none"}>
                              {item.remarks}
                            </span>
                            <Edit2 size={14} className="edit-trigger" onClick={() => startEditing(item._id, item.remarks)} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={`status-wrapper ${item.status.toLowerCase()}`}>
                          {item.status === 'Resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                          <select 
                            value={item.status} 
                            onChange={(e) => updateStatus(item._id, e.target.value)}
                            className="status-dropdown"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-msg">No {activeTab} complaints found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;