import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'dashboard') {
        const data = await adminAPI.getDashboard(user.id);
        setDashboardData(data);
      } else if (activeTab === 'customers') {
        const data = await adminAPI.getCustomers(user.id);
        setCustomers(data);
      } else if (activeTab === 'orders') {
        const data = await adminAPI.getOrders(user.id);
        setOrders(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(user.id, orderId, newStatus);
      alert(`Order status updated to ${newStatus}`);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  const handleResetPoints = async (customerId) => {
    if (window.confirm('Are you sure you want to reset this customer\'s points to 0?')) {
      try {
        await adminAPI.resetCustomerPoints(user.id, customerId);
        alert('Customer points reset successfully');
        fetchData(); // Refresh data
      } catch (err) {
        alert('Failed to reset points: ' + err.message);
      }
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <>
        <Header />
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}!</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'customers' ? 'active' : ''}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : error ? (
            <div className="admin-error">Error: {error}</div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && dashboardData && (
                <div className="dashboard-overview">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total Customers</h3>
                      <p className="stat-number">{dashboardData.totalCustomers}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Orders</h3>
                      <p className="stat-number">{dashboardData.totalOrders}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pending Orders</h3>
                      <p className="stat-number pending">{dashboardData.pendingOrders}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Monthly Income</h3>
                      <p className="stat-number income">${dashboardData.monthlyIncome}</p>
                    </div>
                  </div>

                  <div className="best-selling">
                    <h3>Best Selling Products</h3>
                    <div className="products-list">
                      {dashboardData.bestSellingProducts.map((item, index) => (
                        <div key={index} className="product-item">
                          <img src={item.Product.img} alt={item.Product.name} />
                          <div className="product-info">
                            <h4>{item.Product.name}</h4>
                            <p>Sold: {item.totalSold} units</p>
                            <p>Price: ${item.Product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Customers Tab */}
              {activeTab === 'customers' && (
                <div className="customers-section">
                  <h3>Customer Management</h3>
                  <div className="customers-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Points</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(customer => (
                          <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td>{customer.email}</td>
                            <td>
                              <span className={`points ${customer.points >= 10 ? 'reward-eligible' : ''}`}>
                                {customer.points}
                                {customer.points >= 10 && (
                                  <span className="reward-badge">Free Drink Available!</span>
                                )}
                              </span>
                            </td>
                            <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                            <td>
                              {customer.points > 0 && (
                                <button 
                                  className="reset-points-btn"
                                  onClick={() => handleResetPoints(customer.id)}
                                >
                                  Reset Points
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="orders-section">
                  <h3>Order Management</h3>
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className={`order-card ${order.status}`}>
                        <div className="order-header">
                          <h4>Order #{order.id}</h4>
                          <span className={`status-badge ${order.status}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="order-details">
                          <p><strong>Customer:</strong> {order.User.name} ({order.User.email})</p>
                          <p><strong>Total:</strong> ${order.total}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          
                          <div className="order-items">
                            <h5>Items:</h5>
                            {order.OrderItems.map(item => (
                              <div key={item.id} className="order-item">
                                <img src={item.Product.img} alt={item.Product.name} />
                                <span>{item.Product.name} x{item.quantity}</span>
                                <span>${(item.Product.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="order-actions">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
