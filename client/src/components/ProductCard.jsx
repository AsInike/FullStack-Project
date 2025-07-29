import React from 'react';
import cartIcon from '../assets/addToCart.png';
import '../styles/ProductCard.css';

const ProductCard = ({ img, alt, name, price, id, onAddToCart, buttonText = "Add to cart", isFreeDrink = false, disabled = false }) => {
  const handleImageError = (e) => {
    console.log('Image failed to load:', img);
    e.target.src = 'https://via.placeholder.com/160x160?text=No+Image';
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', img);
  };

  const handleCartIconError = (e) => {
    console.log('Cart icon failed to load:', cartIcon);
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = '🛒';
  };

  const handleCartIconLoad = () => {
    console.log('Cart icon loaded successfully:', cartIcon);
  };

  return (
    <div className="coffee-card">
      <div className="image-container" style={{
        width: '160px',
        height: '160px',
        backgroundColor: 'transparent',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '8px',
        boxSizing: 'border-box'
      }}>
        <img 
          src={img} 
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain', 
            objectPosition: 'center',
            backgroundColor: 'transparent',
            borderRadius: '10px',
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <div className="info">
        <p className="name">{name}</p>
        <p className="price">{isFreeDrink ? "FREE" : `$${price}`}</p>
      </div>
      <button 
        className="add-cart-btn" 
        onClick={onAddToCart}
        disabled={disabled}
        style={{
          background: disabled ? '#666' : (isFreeDrink ? '#ff6b35' : '#D9D9D9'),
          color: disabled ? '#aaa' : (isFreeDrink ? '#fff' : '#000'),
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: isFreeDrink && !disabled ? '0 2px 8px rgba(255, 107, 53, 0.3)' : 'none',
          opacity: disabled ? 0.6 : 1
        }}
      >
        {isFreeDrink ? '🎉' : (
          <img 
            src={cartIcon} 
            alt="Cart" 
            className='cart-icon'
            onError={handleCartIconError}
            onLoad={handleCartIconLoad}
            style={{
              width: '28px',
              height: '28px',
              display: 'block',
              backgroundColor: 'white',
              padding: '2px',
              objectFit: 'contain',
              minWidth: '28px',
              minHeight: '28px',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
          />
        )}
        {buttonText}
      </button>
    </div>
  );
};

export default ProductCard;