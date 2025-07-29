import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Header from '../components/Header';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  // Debug user object
  console.log('AdminDashboard - user object:', user);
  console.log('AdminDashboard - user role:', user?.role);
  console.log('AdminDashboard - authLoading:', authLoading);
  
  // Refresh user data on component mount
  useEffect(() => {
    if (!user || !user.role) {
      console.log('AdminDashboard - Refreshing user data...');
      refreshUser();
    }
  }, [user, refreshUser]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
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
  }, [activeTab, user]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab, fetchData]);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus, userId: user.id });
      await adminAPI.updateOrderStatus(user.id, orderId, newStatus);
      alert(`Order status updated to ${newStatus}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // Show specific error messages for business logic violations
      const errorMessage = err.response?.data?.error || err.message;
      if (errorMessage.includes('rejected payment')) {
        alert('❌ Cannot process order with rejected payment. Only pending or cancelled status allowed.');
      } else if (errorMessage.includes('verified payment')) {
        alert('❌ Cannot deliver order without verified payment. Please verify payment first.');
      } else {
        alert('Failed to update order status: ' + errorMessage);
      }
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

  const handleClaimFreeDrink = async (customerId) => {
    if (window.confirm('Claim free drink for this customer? This will subtract 10 points.')) {
      try {
        await adminAPI.claimFreeDrink(user.id, customerId);
        alert('Free drink claimed successfully! Customer has been notified.');
        fetchData(); // Refresh data
      } catch (err) {
        alert('Failed to claim free drink: ' + err.message);
      }
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      console.log('Frontend - Updating payment status:', { orderId, paymentStatus, userId: user.id });
      await adminAPI.updatePaymentStatus(user.id, orderId, paymentStatus);
      const statusLabel = paymentStatus === 'pending_verification' ? 'Pending' : 
                         paymentStatus === 'verified' ? 'Approved' : 
                         paymentStatus === 'not_verified' ? 'Rejected' : paymentStatus;
      
      if (paymentStatus === 'not_verified') {
        alert(`Payment status updated to ${statusLabel}. Order has been automatically cancelled.`);
      } else {
        alert(`Payment status updated to ${statusLabel}`);
      }
      
      await fetchData(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Check if user is admin - but wait for auth to load first
  if (authLoading) {
    return (
      <>
        <Header showNavbar={false} />
        <div className="admin-loading" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    console.log('AdminDashboard - ACCESS DENIED - user:', user);
    console.log('AdminDashboard - ACCESS DENIED - user.role:', user?.role);
    console.log('AdminDashboard - ACCESS DENIED - Check: !user =', !user, ', user.role !== admin =', user?.role !== 'admin');
    
    return (
      <>
        <Header showNavbar={false} />
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showNavbar={false} />
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
                              <div className="customer-actions">
                                {customer.points >= 10 && (
                                  <button 
                                    className="claim-drink-btn"
                                    onClick={() => handleClaimFreeDrink(customer.id)}
                                  >
                                    Claim Free Drink
                                  </button>
                                )}
                                {customer.points > 0 && (
                                  <button 
                                    className="reset-points-btn"
                                    onClick={() => handleResetPoints(customer.id)}
                                  >
                                    Reset Points
                                  </button>
                                )}
                              </div>
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
                          <p><strong>Customer:</strong> {order.user.name} ({order.user.email})</p>
                          <p><strong>Total:</strong> ${order.total}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          <p><strong>Payment Status:</strong> 
                            <span className={`payment-status ${order.paymentStatus || 'pending_verification'}`}>
                              {order.paymentStatus === 'pending_verification' ? 'PENDING' : 
                               order.paymentStatus === 'verified' ? 'APPROVED' : 
                               order.paymentStatus === 'not_verified' ? 'REJECTED' : 
                               (order.paymentStatus || 'pending_verification').toUpperCase()}
                            </span>
                          </p>
                          {order.paymentReference && (
                            <p><strong>Payment Reference:</strong> {order.paymentReference}</p>
                          )}
                          
                          <div className="order-items">
                            <h5>Items:</h5>
                            {order.OrderItems.map(item => (
                              <div key={item.id} className="order-item">
                                <img src={item.Product.img} alt={item.Product.name} />
                                <span>{item.Product.name} x{item.qty}</span>
                                <span>${(item.Product.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="order-actions">
                            <div className="status-controls">
                              <label>Order Status:</label>
                              <select className='order-status-select'
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
                            
                            <div className="payment-controls">
                              <label>Payment Status:</label>
                              <select className='payment-status-select'
                                value={order.paymentStatus || 'pending_verification'} 
                                onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                              >
                                <option value="pending_verification">Pending</option>
                                <option value="verified">Approved</option>
                                <option value="not_verified">Rejected</option>
                              </select>
                            </div>
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
    </>
  );
};

export default AdminDashboard;
