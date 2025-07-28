import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { contactAPI } from "../services/api";
import "../styles/Contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await contactAPI.send(form.name, form.email, form.message);
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="contact-main">
        <div className="contact-left">
          <h2>Contact-us</h2>
          <p>
            Hey there, coffee lover! We're thrilled to have you as part of our community, and we'd love to hear your thoughts! Your feedback means the world to us – it helps us brew the perfect experience just for you. Drop us a line anytime; we're all ears and ready to make your next visit even better!
          </p>
        </div>
        <div className="contact-right">
          {success && (
            <div className="success-message">
              Thank you for contacting us! We'll get back to you soon.
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Here"
                value={form.name}
                onChange={handleChange}
                required
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
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Enter your message here..."
                value={form.message}
                onChange={handleChange}
                required
                disabled={loading}
                rows="5"
              />
            </div>
            <button 
              type="submit" 
              className="contact-submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;