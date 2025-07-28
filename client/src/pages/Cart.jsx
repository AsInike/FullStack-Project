import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import LocationModal from "../components/LocationModal";
import "../styles/Cart.css";
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const { user } = useAuth();

  // Fetch cart items
  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await cartAPI.getItems(user.id);
      setCartItems(data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Update quantity
  const updateQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    
    try {
      await cartAPI.updateItem(cartItemId, newQty);
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    try {
      await cartAPI.removeItem(cartItemId);
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    console.log('Selected location:', location);
  };

  // Handle add location button click
  const handleAddLocationClick = () => {
    setIsLocationModalOpen(true);
  };

  const total = cartItems.reduce((sum, item) => sum + item.qty * (item.Product?.price || 0), 0);

  if (!user) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="cart-content">
            <h2 className="cart-title">My Cart :</h2>
            <div className="empty-cart">
              <p>Please login to view your cart</p>
              <Link to="/login" className="cart-link">Go to Login</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="cart-content">
            <h2 className="cart-title">My Cart :</h2>
            <div className="loading-cart">
              <p>Loading cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="cart-content">
          <h2 className="cart-title">My Cart :</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <Link to="/menu" className="cart-link">Go to Menu</Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    {/* Remove button - positioned absolutely in top-right */}
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>

                    <div className="item-image">
                      <img 
                        src={item.Product?.img || 'https://via.placeholder.com/80x80?text=No+Image'} 
                        alt={item.Product?.name || 'Product'} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                    </div>
                    
                    <div className="item-divider"></div>
                    
                    <div className="item-content">
                      <div className="item-info">
                        <h3 className="item-name">{item.Product?.name || 'Unknown Product'}</h3>
                        
                        <div className="item-bottom">
                          <div className="quantity-controls">
                            <button 
                              className="qty-btn minus"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                            >
                              -
                            </button>
                            <span className="quantity">{item.qty}</span>
                            <button 
                              className="qty-btn plus"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="item-price">
                            <span className="price-text">
                              {item.qty} X ${item.Product?.price?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location Section */}
              <div className="location-section">
                <button 
                  className="add-location-btn"
                  onClick={handleAddLocationClick}
                >
                  <span className="plus-icon">+</span>
                  {deliveryLocation ? 'Change delivery location' : 'Add your receive location'}
                </button>
                
                {deliveryLocation && (
                  <div className="selected-location-display">
                    <div className="location-icon">📍</div>
                    <div className="location-details">
                      <h4>Delivery Location:</h4>
                      <p>{deliveryLocation.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Total and Pay Button */}
              <div className="cart-footer">
                <div className="total-section">
                  <span className="total-label">Total Amount :</span>
                  <span className="total-amount">${total.toFixed(2)}</span>
                </div>
                <Link 
                  to="/payment" 
                  className="pay-now-btn"
                  state={{ deliveryLocation, cartItems, total }}
                >
                  Pay Now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={deliveryLocation}
      />
    </>
  );
};

export default Cart;