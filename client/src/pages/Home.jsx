import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import "../styles/Home.css";
import Footer from '../components/Footer';
import homeBanner from '../assets/home-banner.jpg'; 
import banner2 from '../assets/banner2.png';
import ProductCard from '../components/ProductCard';
import aba from '../assets/aba.png';
import ace from '../assets/acelada.png';
import sath from '../assets/sathapana.png';
import wing from '../assets/wing.webp';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch 3 products from each category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Get 3 products from each category
        const categories = ['Hot', 'Ice', 'Frappe', 'Bakery'];
        const selectedProducts = [];
        
        categories.forEach(category => {
          const categoryProducts = data.filter(product => product.category === category);
          selectedProducts.push(...categoryProducts.slice(0, 3));
        });
        
        setProducts(selectedProducts);
        setError('');
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
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

  return (
    <>
      <Header />
      <main>
        <div className="home-content"> 
          <img src={homeBanner} alt="Coffee-banner" />
          <div className="banner-text">
            <h1 className="slo1">Savor the perfect</h1>
            <h1 className="slo2">Brew!</h1>
            <p className="te">Behind every successful day is a well-brewed morning.</p>
            <Link to="/menu" className="order">Order Now</Link>
          </div>  
        </div> 
        <div>
          <h1 className="top">TOP CATEGORIES</h1>
          <h3 className='top1'>Explore our best selling products in our store</h3>
        </div>
        
        {loading ? (
          <div className="coffee-row">
            <p style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="coffee-row">
            <p style={{ color: 'red', textAlign: 'center', gridColumn: '1 / -1' }}>
              {error}
            </p>
          </div>
        ) : (
          <div className="coffee-row">
            {products.map((product) => (
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
        )}
        
        <div className="banner2"> 
          <img src={banner2} alt="Coffee-banner" />
          <div className="banner-text1">
            <h1 className="sl1">Proudly Serving Coffee from Ratanak Kiri</h1>
            <p className="te1">Our beans are locally sourced from a farm in Ratanak Kiri — known for its rich flavor and smooth aroma. This is the main source of coffee we use, bringing you a bold, fresh taste in every cup.</p>
          </div>  
        </div>
        <div>
          <h1 className="top2">About Us</h1>
          <h3 className='top3'>Rooted in family values and a love for great coffee, our shop was built on a simple idea—quality over quantity.<br /> We proudly use coffee beans grown in the rich soils of Ratanak Kiri, supporting local farmers and bringing you a brew that's honest, bold, and full of character.</h3>
        </div>
        <div className='payment'>
          <h1>Payment Method :</h1>
          <img src={aba} alt="ABA" />
          <img src={ace} alt="ACELEDA" />
          <img src={wing} alt="WING" />
          <img src={sath} alt="SATHAPANA" />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;