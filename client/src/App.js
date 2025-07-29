import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerOnlyRoute, AdminOnlyRoute } from './components/RouteProtection';

// Import your pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Payment from './pages/Payment';
import History from './pages/History';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <CustomerOnlyRoute>
              <Home />
            </CustomerOnlyRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/menu" element={
            <CustomerOnlyRoute>
              <Menu />
            </CustomerOnlyRoute>
          } />
          <Route path="/cart" element={
            <CustomerOnlyRoute>
              <Cart />
            </CustomerOnlyRoute>
          } />
          <Route path="/contact" element={
            <CustomerOnlyRoute>
              <Contact />
            </CustomerOnlyRoute>
          } />
          <Route path="/payment" element={
            <CustomerOnlyRoute>
              <Payment />
            </CustomerOnlyRoute>
          } />
          <Route path="/history" element={
            <CustomerOnlyRoute>
              <History />
            </CustomerOnlyRoute>
          } />
          <Route path="/orders" element={
            <CustomerOnlyRoute>
              <Orders />
            </CustomerOnlyRoute>
          } />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;