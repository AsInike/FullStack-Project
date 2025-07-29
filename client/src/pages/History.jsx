import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import Header from '../components/Header';
import '../styles/History.css';

const History = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // For accurate points calculation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to refresh order data - memoized to prevent infinite loops
  const refreshOrderData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await ordersAPI.getHistory(user.id);
      
      // Store all orders for accurate points calculation
      setAllOrders(response);
      
      // Filter orders to show in history:
      // - Orders with payment status verified (approved) or not_verified (rejected)
      // - Orders that are not in pending_verification state
      const historyOrders = response.filter(order => 
        order.paymentStatus === 'verified' || 
        order.paymentStatus === 'not_verified' ||
        order.paymentStatus === 'approved' ||
        order.paymentStatus === 'rejected'
      );
      
      setOrders(historyOrders);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Fetch order data when user ID changes or when user points change (after free drink claims)
    if (user?.id) {
      refreshOrderData();
    }
  }, [user?.id, user?.points, refreshOrderData]); // Also depend on user points to refresh when they change

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'preparing': return '#9c27b0';
      case 'ready': return '#4caf50';
      case 'delivered': return '#8bc34a';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getPaymentStatusDisplay = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending_verification':
        return { text: 'Payment Pending', color: '#ff9800' };
      case 'verified':
      case 'approved':
        return { text: 'Payment Approved', color: '#4caf50' };
      case 'not_verified':
      case 'rejected':
        return { text: 'Payment Rejected', color: '#f44336' };
      default:
        return { text: 'Unknown', color: '#757575' };
    }
  };

  const calculateTotalPoints = () => {
    // Calculate total points earned from ALL delivered orders with verified payment
    // Use allOrders (not filtered orders) for accurate total calculation
    // Orders are already sorted by createdAt DESC (latest to oldest)
    const totalEarned = allOrders.reduce((total, order) => {
      if (order.status === 'delivered' && 
          (order.paymentStatus === 'verified' || order.paymentStatus === 'approved')) {
        return total + (order.points || 0);
      }
      return total;
    }, 0);
    
    return totalEarned;
  };

  const calculateFreeDrinksRedeemed = () => {
    // Calculate how many free drinks have been claimed
    // Logic: If total earned is 41 and current is 1, then 40 points were used for 4 free drinks
    const totalEarned = calculateTotalPoints();
    const currentPoints = user.points || 0;
    
    // Calculate points that were spent on free drinks
    const pointsSpent = totalEarned - currentPoints;
    
    // Each free drink costs 10 points
    const freeDrinksRedeemed = Math.max(0, Math.floor(pointsSpent / 10));
    
    // Debug logging
    console.log('Free drinks calculation:', {
      totalEarned,
      currentPoints,
      pointsSpent,
      freeDrinksRedeemed,
      calculation: `${totalEarned} - ${currentPoints} = ${pointsSpent} points spent ÷ 10 = ${freeDrinksRedeemed} free drinks`
    });
    
    return freeDrinksRedeemed;
  };

  const handleClaimFreeDrink = async () => {
    try {
      const confirmed = window.confirm('Claim your free drink? You will be redirected to the menu to choose any drink you like!');
      if (!confirmed) return;

      // Check if user has enough points
      if (user.points < 10) {
        alert('You need at least 10 points to claim a free drink.');
        return;
      }

      // Redirect to menu with free drink mode
      // We'll pass the free drink claim in the URL
      window.location.href = '/menu?freeDrink=true';
      
    } catch (error) {
      console.error('Error claiming free drink:', error);
      alert(`Failed to claim free drink: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="history-container">
          <div className="auth-required">
            <h2>Please log in to view your order history</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="history-container">
        <div className="history-header">
          <h1>Order History</h1>
          <div className="points-summary">
            <div className="points-card">
              <h3>Current Points</h3>
              <div className="points-display">
                <span className="points-number">{user.points || 0}</span>
                {user.points >= 10 ? (
                  <button 
                    className="claim-free-drink-btn"
                    onClick={handleClaimFreeDrink}
                  >
                    🎉 Choose Free Drink! (10 points)
                  </button>
                ) : (
                  <span className="points-needed">
                    Need {10 - (user.points || 0)} more points for free drink
                  </span>
                )}
              </div>
            </div>
            <div className="points-card">
              <h3>Total Earned Points</h3>
              <div className="points-display">
                <span className="points-number">{calculateTotalPoints()}</span>
                <small style={{color: '#cccccc', fontSize: '0.8rem', backgroundColor: 'transparent'}}>
                  (All drinks purchased)
                </small>
              </div>
            </div>
            <div className="points-card">
              <h3>Free Drinks Claimed</h3>
              <div className="points-display">
                <span className="points-number">{calculateFreeDrinksRedeemed()}</span>
                <small style={{color: '#cccccc', fontSize: '0.8rem', backgroundColor: 'transparent'}}>
                  (10 points each)
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading">Loading your order history...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <h3>No orders yet</h3>
              <p>Start ordering to build your history and earn points!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>Order #{order.id}</h4>
                      <div className="status-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        {order.paymentStatus && (
                          <span 
                            className="payment-status-badge"
                            style={{ backgroundColor: getPaymentStatusDisplay(order.paymentStatus).color }}
                          >
                            {getPaymentStatusDisplay(order.paymentStatus).text}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-items">
                      <h5>Items Ordered:</h5>
                      {order.OrderItems && order.OrderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <img 
                            src={item.Product?.img} 
                            alt={item.Product?.name}
                            className="item-image"
                          />
                          <div className="item-details">
                            <span className="item-name">{item.Product?.name}</span>
                            <span className="item-quantity">x{item.qty}</span>
                            <span className="item-price">${(item.Product?.price * item.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Total Amount:</span>
                        <span className="total-amount">${order.total}</span>
                      </div>
                      {order.points && order.status === 'delivered' && 
                       (order.paymentStatus === 'verified' || order.paymentStatus === 'approved') && (
                        <div className="summary-row points-earned">
                          <span>Points Earned:</span>
                          <span className="points-value">+{order.points}</span>
                        </div>
                      )}
                      {order.paymentReference && (
                        <div className="summary-row">
                          <span>Payment Reference:</span>
                          <span className="payment-ref">{order.paymentReference}</span>
                        </div>
                      )}
                      {order.deliveryLocation && (
                        <div className="summary-row">
                          <span>Delivery Location:</span>
                          <span className="delivery-location">{order.deliveryLocation}</span>
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
    </>
  );
};

export default History;
