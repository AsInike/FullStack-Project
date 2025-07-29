import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Component to protect customer-only routes from admin access
export const CustomerOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (user && user.role === 'admin') {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '40px'
        }}>
          <h2 style={{ color: '#f4a261', marginBottom: '20px' }}>Admin Access Restricted</h2>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
            As an admin, you can only access the Admin Dashboard.
          </p>
          <p style={{ marginBottom: '30px' }}>
            Customer features like shopping, cart, and menu are not available for admin accounts.
          </p>
          <a 
            href="/admin-dashboard" 
            style={{
              background: '#f4a261',
              color: '#2c1810',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Go to Admin Dashboard
          </a>
        </div>
        <Footer />
      </>
    );
  }

  return children;
};

// Component to protect admin-only routes from customer access
export const AdminOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '40px'
        }}>
          <h2 style={{ color: '#f4a261', marginBottom: '20px' }}>Authentication Required</h2>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
            Please login with admin credentials to access the dashboard.
          </p>
          <a 
            href="/login" 
            style={{
              background: '#f4a261',
              color: '#2c1810',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Login
          </a>
        </div>
        <Footer />
      </>
    );
  }

  if (user.role !== 'admin') {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '40px'
        }}>
          <h2 style={{ color: '#f4a261', marginBottom: '20px' }}>Admin Access Required</h2>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
            You need admin privileges to access this page.
          </p>
          <p style={{ marginBottom: '30px' }}>
            Please contact an administrator if you need admin access.
          </p>
          <a 
            href="/" 
            style={{
              background: '#f4a261',
              color: '#2c1810',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Home
          </a>
        </div>
        <Footer />
      </>
    );
  }

  return children;
};
