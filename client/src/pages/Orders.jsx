import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Orders.css';

const Orders = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { orderReference, orderId, message, orderData } = location.state || {};
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userOrders = await ordersAPI.getByUser(user.id);
      setOrders(userOrders || []);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_verification':
        return '#ff9800';
      case 'verified':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'completed':
        return '#2196f3';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#607d8b';
    }
  };

  const getStatusText = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'pending_verification') return 'Payment Verification Pending';
    if (paymentStatus === 'verified') return 'Payment Verified';
    if (paymentStatus === 'rejected') return 'Payment Rejected';
    if (orderStatus === 'completed') return 'Order Completed';
    if (orderStatus === 'cancelled') return 'Order Cancelled';
    return 'Processing';
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="orders-main">
          <div className="orders-container">
            <div className="no-user">
              <h2>Please Login</h2>
              <p>You need to be logged in to view your orders.</p>
              <Link to="/login" className="login-btn">Go to Login</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="orders-main">
        <div className="orders-container">
          {/* Success Message for New Order */}
          {orderReference && (
            <div className="order-success">
              <h2>Order Submitted Successfully!</h2>
              <div className="success-details">
                <p>Order Reference:</p>
                <div className="reference-display">
                  {orderReference}
                </div>
                {message && <p className="success-message">{message}</p>}
                <p>We will verify your payment and update your order status shortly.</p>
              </div>
            </div>
          )}

          {/* Orders List */}
          <div className="orders-section">
            <div className="orders-header">
              <h2>My Orders</h2>
              <Link to="/menu" className="continue-shopping">Continue Shopping</Link>
            </div>

            {loading ? (
              <div className="loading-orders">
                <p>Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="error-orders">
                <p>{error}</p>
                <button onClick={fetchUserOrders} className="retry-btn">Retry</button>
              </div>
            ) : orders.length === 0 ? (
              <div className="no-orders">
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet.</p>
                <Link to="/menu" className="start-shopping">Start Shopping</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Order #{order.paymentReference}</h3>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div 
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.paymentStatus) }}
                      >
                        {getStatusText(order.paymentStatus, order.status)}
                      </div>
                    </div>

                    <div className="order-content">
                      <div className="order-items">
                        <h4>Items:</h4>
                        {order.OrderItems?.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <img 
                              src={item.Product?.img || 'https://via.placeholder.com/50x50?text=No+Image'} 
                              alt={item.Product?.name} 
                              className="item-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                              }}
                            />
                            <div className="item-details">
                              <span className="item-name">{item.Product?.name || 'Unknown Product'}</span>
                              <span className="item-qty-price">
                                {item.qty} x ${item.price?.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-details">
                        <div className="order-total">
                          <strong>Total: ${order.total?.toFixed(2)}</strong>
                        </div>
                        
                        {order.deliveryLocation && (
                          <div className="delivery-location">
                            <h5>📍 Delivery Location:</h5>
                            <p>{JSON.parse(order.deliveryLocation).address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Orders;