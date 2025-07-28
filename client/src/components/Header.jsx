import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/Header.css";
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    alert('Logged out successfully');
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
      <nav className="navbar">
        <Link to="/" className='h'>Home</Link>
        <Link to="/menu" className='m'>Menu</Link>
        {user && user.role === 'admin' ? (
          <Link to="/admin-dashboard" className='c'>Dashboard</Link>
        ) : user ? (
          <Link to="/orders" className='c'>Orders</Link>
        ) : (
          <Link to="/contact" className='c'>Contact</Link>
        )}
        {user && <Link to="/cart" className='c'>Cart</Link>}
      </nav>
    </header>
  );
};

export default Header;