import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Send contact email
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    console.log('Contact form submission:', { name, email, message });
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // For development - just log and return success (since you don't have SMTP setup)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 NEW CONTACT MESSAGE RECEIVED:');
      console.log('======================================');
      console.log('👤 Customer Name:', name);
      console.log('📧 Customer Email:', email);
      console.log('💬 Message:', message);
      console.log('🕐 Time:', new Date().toLocaleString());
      console.log('======================================');
      
      return res.json({ 
        message: 'Thank you for your message! We have received your inquiry and will get back to you soon.',
        success: true 
      });
    }

    // Create transporter (when you set up email later)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail for sending
        pass: process.env.EMAIL_PASS  // Your app password
      }
    });

    // Email to your company (you receive customer's message)
    const mailOptions = {
      from: process.env.EMAIL_USER, // System email (your Gmail)
      to: 'asinike.ratana@student.cadt.edu.kh', // Your company email (receives messages)
      replyTo: email, // Customer's email (so you can reply directly)
      subject: `☕ New Contact Message from ${name} - Coffee Shop`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E;">New Customer Message</h2>
          
          <div style="background-color: #FFF8DC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">Customer Information:</h3>
            <p><strong>👤 Name:</strong> ${name}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #F5F5DC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">💬 Message:</h3>
            <p style="line-height: 1.6; color: #333;">${message}</p>
          </div>
          
          <div style="background-color: #E6E6FA; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>💡 Note:</strong> You can reply directly to this email to respond to ${name} at ${email}
            </p>
          </div>
          
          <footer style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #DDD;">
            <p style="color: #888; font-size: 12px;">This message was sent from your Coffee Shop contact form</p>
          </footer>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Contact email sent successfully to:', 'asinike.ratana@student.cadt.edu.kh');

    res.json({ 
      message: 'Thank you for your message! We have received your inquiry and will get back to you soon.',
      success: true 
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ 
      error: 'Sorry, there was an issue sending your message. Please try again later.',
      details: error.message 
    });
  }
});

export default router;