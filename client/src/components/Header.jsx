import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Header.css";
import { useAuth } from '../context/AuthContext';

const Header = ({ showNavbar = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert('Logged out successfully');
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header>
      <div className="flex">
        <p className="logo"><Link to="/" className="Mar">Marché</Link></p>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', backgroundColor: 'transparent', padding: '5px 10px', borderRadius: '5px' }}>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="Sbutton">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="Sbutton">Signup / Signin</Link>
        )}
      </div>
      {/* Only show navbar if showNavbar is true and user is not admin */}
      {showNavbar && (!user || user.role !== 'admin') && (
        <nav className="navbar">
          <Link to="/" className='h'>Home</Link>
          <Link to="/menu" className='m'>Menu</Link>
          {user ? (
            <>
              <Link to="/cart" className='c'>Cart</Link>
              <Link to="/orders" className='c'>Orders</Link>
              <Link to="/history" className='c'>History</Link>
            </>
          ) : (
            <Link to="/contact" className='c'>Contact</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;