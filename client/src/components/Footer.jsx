import React from 'react';
import "../styles/Footer.css";
import { Link } from 'react-router-dom';
import facebookIcon from '../assets/facebook.svg';
import instagramIcon from '../assets/instagram.svg';
import tiktokIcon from '../assets/tik-tok.svg'; 

const Footer = () => (
  <footer>
    <Link to="/" className="logo2">Marché</Link>
    <hr />
    <div className="footer">
      <div className="ul-footer">
        <div className="ul">
          <span>Product</span>
          <ul>
            <li><Link to="/menu" className="M">Menu</Link></li>
            <li><span className="C">Coffee beans</span></li>
          </ul>
        </div>
        <div className="ul">
          <span>Company info</span>
          <ul>
            <li><Link to="/contact" className="M">Contact us</Link></li>
            <li><span className="C">FAQs</span></li>
          </ul>
        </div>
        <div className="ul">
          <span>Follow us</span>
          <ul>
            <li><a href="https://www.facebook.com/share/171sCCqM3W/?mibextid=wwXIfr" className="M" target="_blank" rel="noopener noreferrer"><img src={facebookIcon} alt="Facebook" className='icon'/>Facebook</a></li>
            <li><a href="https://www.instagram.com/_porcheul_?igsh=MWpicHZkZDNhNmttOA%3D%3D&utm_source=qr" className="C" target="_blank" rel="noopener noreferrer"><img src={instagramIcon} alt="Instagram" className='icon'/>Instagram</a></li>
            <li><a href="https://vt.tiktok.com/ZSHpFsNqgoPqe-lyBAj/" className="A" target="_blank" rel="noopener noreferrer"><img src={tiktokIcon} alt="Tiktok" className='icon'/>Tiktok</a></li>
          </ul>
        </div>
      </div>
      <div className="rights">© {new Date().getFullYear()} Marché Coffee. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;