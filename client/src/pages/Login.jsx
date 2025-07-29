import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Starting login process...');
      const userData = await login(email, password);
      console.log('Login successful, userData:', userData);
      
      // Ensure localStorage is updated
      if (userData.id && userData.role) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data saved to localStorage:', userData);
      }
      
      alert('Login successful!');
      
      // Small delay to ensure state updates
      setTimeout(() => {
        // Redirect based on user role
        if (userData && userData.role === 'admin') {
          console.log('User is admin, navigating to admin dashboard...');
          window.location.href = '/admin-dashboard'; // Force full page navigation
          console.log('Window location changed to admin dashboard');
        } else {
          console.log('User is customer, navigating to home...');
          navigate('/', { replace: true });
        }
      }, 100);
      
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="login-bg">
        <div className="login-container">
          <h2>Sign in</h2>
          {error && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter Here" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter Here" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="login-links">
              <span>Don't have an Account ?</span>
              <Link to="/signup" className="create-link">Create Now</Link>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;