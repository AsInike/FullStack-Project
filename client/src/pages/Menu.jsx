import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import "../styles/Menu.css";
import menuBanner from '../assets/menu-banner.png';
import ProductCard from '../components/ProductCard';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuData, setMenuData] = useState([]);

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

    try {
      await cartAPI.addItem(user.id, product.id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
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
          <Link to="/cart" className="cart">View Cart</Link>
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