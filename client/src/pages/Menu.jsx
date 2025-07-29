import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import "../styles/Menu.css";
import menuBanner from '../assets/menu-banner.png';
import ProductCard from '../components/ProductCard';
import { cartAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [isClaimingFreeDrink, setIsClaimingFreeDrink] = useState(false);
  
  // Check if this is free drink mode
  const isFreeDrinkMode = new URLSearchParams(location.search).get('freeDrink') === 'true';

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        
        // Group products by category
        const groupedProducts = groupProductsByCategory(data);
        setMenuData(groupedProducts);
        setError('');
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setProducts([]);
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category
  const groupProductsByCategory = (products) => {
    const categories = ['Hot', 'Ice', 'Frappe', 'Bakery'];
    return categories.map(category => ({
      category,
      products: products.filter(product => product.category === category)
    })).filter(section => section.products.length > 0); // Only show categories with products
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    // Handle free drink selection
    if (isFreeDrinkMode) {
      // Prevent multiple rapid clicks
      if (isClaimingFreeDrink) {
        console.log('🚫 Already claiming free drink, ignoring duplicate click');
        return;
      }

      const confirmed = window.confirm(`Claim "${product.name}" as your free drink?`);
      if (!confirmed) return;

      try {
        // Check if user has enough points (use fresh data from context)
        const currentPoints = user.points || 0;
        console.log('🔍 Checking points:', { currentPoints, required: 10 });
        
        if (currentPoints < 10) {
          alert('You need at least 10 points to claim a free drink.');
          navigate('/history');
          return;
        }

        // Create a free drink order directly
        await handleFreeDrinkClaim(product);
        
      } catch (error) {
        console.error('Error claiming free drink:', error);
        // Don't show another alert here since handleFreeDrinkClaim already handles it
        // Just log the error
      }
      return;
    }

    // Regular add to cart functionality
    try {
      await cartAPI.addItem(user.id, product.id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleFreeDrinkClaim = async (product) => {
    try {
      // Prevent multiple clicks
      if (isClaimingFreeDrink) {
        console.log('🚫 Already claiming free drink, ignoring duplicate click');
        return;
      }
      
      const confirmed = window.confirm(`Claim "${product.name}" as your free drink?`);
      if (!confirmed) return;

      console.log('🎯 Starting free drink claim process');
      console.log('👤 Current user points before claim:', user?.points);
      console.log('🥤 Product being claimed:', product.name);
      
      // Validate user has enough points
      if (!user || user.points < 10) {
        if (user) {
          alert('You need at least 10 points to claim a free drink.');
          console.log('❌ Insufficient points. Current points:', user.points);
        } else {
          alert('Please log in to claim a free drink.');
          console.log('❌ User not logged in');
        }
        return;
      }

      console.log('✅ Point validation passed, proceeding with claim');
      setIsClaimingFreeDrink(true);

      // Create the order data for free drink
      const orderData = {
        userId: user.id,
        items: [{
          Product: {
            id: product.id,
            name: product.name,
            price: 0, // Free drink
            category: product.category
          },
          productId: product.id,
          qty: 1,
          price: 0
        }],
        total: 0,
        paymentReference: `FREE-DRINK-${Date.now()}`, // Generate a unique reference for free drinks
        paymentMethod: 'points',
        paymentStatus: 'verified', // Automatically approved for free drinks
        status: 'approved',
        contactNumber: user.phone || 'N/A',
        deliveryLocation: null,
        isFreeDrink: true // Flag to indicate this is a free drink
      };

      console.log('📤 Sending order data:', orderData);
      const response = await ordersAPI.create(orderData);
      console.log('✅ Order created successfully:', response);
      
      // Update user points in context if the backend returned updated user data
      if (response.user) {
        console.log('🔄 Free drink claimed successfully!');
        console.log('📊 Points before claim (from user context):', user?.points);
        console.log('📊 Points after claim (from response):', response.user.points);
        console.log('📊 Points difference:', (user?.points || 0) - response.user.points);
        
        // Update localStorage with new user data
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('💾 Current localStorage user data:', currentUserData);
        const updatedUserData = { ...currentUserData, ...response.user };
        console.log('💾 Updated localStorage user data:', updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Refresh the auth context to get the updated points
        console.log('🔄 Calling refreshUser()');
        const refreshedUser = refreshUser();
        console.log('🔄 RefreshUser returned:', refreshedUser);
        console.log('🔄 Current user context after refresh:', user);
        
        // Force a small delay to ensure context updates
        setTimeout(() => {
          console.log('🔄 User context after timeout:', user);
        }, 100);
      }
      
      alert(`🎉 Free drink "${product.name}" claimed successfully! Your order has been placed and approved. You now have ${response.user?.points || 'updated'} points.`);
      
      // Redirect to orders page to see the new order
      navigate('/orders');
      
    } catch (error) {
      console.error('❌ Error creating free drink order:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // Check if it's a specific error that we can handle
      if (error.response?.data?.error === 'Insufficient points for free drink') {
        alert(`You don't have enough points. You need 10 points but only have ${error.response.data.currentPoints}.`);
        navigate('/history');
      } else {
        alert(`Failed to claim free drink: ${error.response?.data?.details || error.message}`);
      }
      throw error;
    } finally {
      console.log('🏁 Claim process finished, setting isClaimingFreeDrink to false');
      setIsClaimingFreeDrink(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <h2>Loading menu...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h2>{error}</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="menu-content"> 
        <img src={menuBanner} alt="Menu-banner" />
        <div className="banner-menu-text">
          <h1 className="slo3">Savor the perfect</h1>
          <h1 className="slo4">Brew!</h1>
          {isFreeDrinkMode ? (
            <div className="free-drink-banner">
              <h2 style={{color: '#ff6b35', margin: '10px 0'}}>🎉 Select Your FREE Drink! 🎉</h2>
              <p style={{color: '#fff', fontSize: '1.1rem'}}>Choose any drink below to claim with your 10 points</p>
            </div>
          ) : (
            <Link to="/cart" className="cart">View Cart</Link>
          )}
        </div>  
      </div> 
      <h1 className="menu-title">Menu</h1>
      <div className="menu-section">
        {menuData.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
            <p>No products available</p>
          </div>
        ) : (
          menuData.map((section, idx) => (
            <div key={idx}>
              <h2 className="menu-category">{section.category}</h2>
              <div className="menu-grid">
                {section.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    img={product.img}
                    alt={product.name}
                    name={product.name}
                    price={product.price}
                    onAddToCart={() => handleAddToCart(product)}
                    buttonText={isFreeDrinkMode ? (isClaimingFreeDrink ? "Claiming..." : "Claim Free!") : "Add to cart"}
                    isFreeDrink={isFreeDrinkMode}
                    disabled={isFreeDrinkMode && isClaimingFreeDrink}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Menu;