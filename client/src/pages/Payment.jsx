import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../components/Header";      
import Footer from "../components/Footer";
import "../styles/Payment.css";   
import { QRCodeCanvas } from "qrcode.react";
import { ordersAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentReference, setPaymentReference] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from cart
  const { deliveryLocation, cartItems, total } = location.state || {};

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Generate unique payment reference
    const reference = generatePaymentReference();
    setPaymentReference(reference);
    
    // Create order data
    const order = {
      userId: user?.id,
      items: cartItems,
      total: total,
      deliveryLocation: deliveryLocation,
      paymentReference: reference,
      status: 'pending'
    };
    setOrderData(order);
  }, [cartItems, total, deliveryLocation, user, navigate]);

  const generatePaymentReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CF${timestamp}${random}`;
  };

  // Create dynamic QR code with payment reference
  const createPaymentQR = () => {
    const baseURL = 'https://pay.ababank.com/1xYxUqy1ZvK2qBkA6';
    const amount = total.toFixed(2);
    const reference = paymentReference;
    
    return `${baseURL}?amount=${amount}&ref=${reference}&desc=Coffee Shop Order`;
  };

  // Clear user's cart after successful order
  const clearUserCart = async () => {
    try {
      // Get all cart items for the user
      const userCartItems = await cartAPI.getItems(user.id);
      
      // Remove each item from cart
      await Promise.all(
        userCartItems.map(item => cartAPI.removeItem(item.id))
      );
      
      console.log('✅ Cart cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      // Don't throw error as order was successful
    }
  };

  const handlePaymentVerification = async () => {
    setIsSubmitting(true);
    try {
      console.log('🔍 Submitting order...');
      console.log('📊 Order data being sent:', {
        ...orderData,
        paymentReference,
        paymentStatus: 'pending_verification'
      });
      
      // Create order in database
      const response = await ordersAPI.create({
        ...orderData,
        paymentReference,
        paymentStatus: 'pending_verification'
      });
      
      console.log('✅ Order created successfully:', response);
      
      // Clear the cart after successful order creation
      await clearUserCart();
      
      // Show success message and redirect
      alert(`Payment submitted! Your reference number is: ${paymentReference}\n\nPlease keep this reference for verification. We will confirm your payment shortly.`);
      
      // Redirect to orders page with order details
      navigate('/orders', { 
        state: { 
          orderReference: paymentReference,
          orderId: response.id,
          message: 'Payment submitted for verification',
          orderData: {
            ...orderData,
            id: response.id,
            paymentStatus: 'pending_verification',
            createdAt: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to submit order: ${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Header />
        <main className="payment-main">
          <div className="payment-error">
            <h2>No items to pay for</h2>
            <p>Please add items to your cart first.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="payment-main">
        <div className="payment-container">
          <div className="payment-header">
            <h2>Payment</h2>
            <p>Complete your coffee order payment</p>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span className="item-name">{item.Product?.name}</span>
                  <span className="item-price">${(item.Product?.price).toFixed(2)}</span>
                  <span className="item-qty">x {item.qty}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
            
            {deliveryLocation && (
              <div className="delivery-info">
                <h4>📍 Delivery Location:</h4>
                <p>{deliveryLocation.address}</p>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <div className="payment-reference">
              <h3>Payment Reference</h3>
              <div className="reference-code">
                <strong>{paymentReference}</strong>
              </div>
              <p className="reference-note">
                Please include this reference in your payment description
              </p>
            </div>

            <div className="qr-payment">
              <h3>Scan QR Code to Pay</h3>
              <div className="qr-code-container">
                <div className="qr-code">
                  <QRCodeCanvas
                    value={createPaymentQR()}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                  <strong className='payment-amount'>Amount: ${total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="payment-instructions">
              <h4>Payment Instructions:</h4>
              <ol>
                <li>Scan the QR code with your banking app</li>
                <li>Enter the exact amount: <strong>${total.toFixed(2)}</strong></li>
                <li>Include the reference: <strong>{paymentReference}</strong></li>
                <li>Complete the payment</li>
                <li>Click "I've Paid" button below</li>
              </ol>
            </div>

            <div className="payment-actions">
              <button 
                className="payment-confirm-btn"
                onClick={handlePaymentVerification}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : "I've Paid - Submit Order"}
              </button>
              
              <button 
                className="payment-cancel-btn"
                onClick={() => navigate('/cart')}
              >
                Cancel & Return to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Payment;