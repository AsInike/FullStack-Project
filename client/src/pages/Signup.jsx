import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState(''); // Add name field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth(); // Use AuthContext
  const navigate = useNavigate();

  // Load saved email if present
  useEffect(() => {
    const savedEmail = localStorage.getItem('signupEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  console.log('Form submitted with:', { name, email, password: '***' }); // Debug log
  
  if (password !== rePassword) {
    setError("Re-entered password does not match!");
    return;
  }
  
  if (password.length < 6) {
    setError("Password must be at least 6 characters long!");
    return;
  }

  setLoading(true);
  
  try {
    console.log('Calling register function...'); // Debug log
    
    // Use AuthContext register function
    await register(name, email, password);
    
    if (rememberMe) {
      localStorage.setItem('signupEmail', email);
    } else {
      localStorage.removeItem('signupEmail');
    }
    
    alert('Signup successful!');
    navigate('/'); // Redirect to home page
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    setError(error.message || 'Signup failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Header />
      <main className="login-bg">
        <div className="login-container">
          <h2>Sign up</h2>
          {error && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Here"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Here"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="repassword">Re-enter Password</label>
              <input
                type="password"
                id="repassword"
                name="repassword"
                placeholder="Enter Here"
                required
                value={rePassword}
                onChange={e => setRePassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ marginLeft: '30px' }}
                disabled={loading}
              />
              <label htmlFor="rememberMe" style={{ color: '#ede0c6', fontSize: '1rem' }}>Remember Me</label>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <div className="login-links" style={{ marginTop: '15px' }}>
              <span style={{ backgroundColor: 'transparent' }}>Already have an account?</span>
              <Link to="/login" className="create-link">Login Now</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;