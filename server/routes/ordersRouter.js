import express from 'express';
import { Order, OrderItem, Product, User } from '../models/index.js';

const router = express.Router();

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Orders router is working!' });
});

// Create new order (remove auth middleware for now)
router.post('/', async (req, res) => {
  try {
    console.log('📝 Order creation request received:', req.body);
    
    const { userId, items, total, deliveryLocation, paymentReference, paymentStatus } = req.body;
    
    // Validate required fields
    if (!userId || !items || !total || !paymentReference) {
      console.log('❌ Missing required fields:', { userId, itemsCount: items?.length, total, paymentReference });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'userId, items, total, and paymentReference are required'
      });
    }
    
    console.log('📝 Creating order for user:', userId, 'with total:', total);
    
    // Create order
    const order = await Order.create({
      userId: parseInt(userId),
      total: parseFloat(total),
      deliveryLocation: deliveryLocation ? JSON.stringify(deliveryLocation) : null,
      paymentReference,
      paymentStatus: paymentStatus || 'pending_verification',
      status: 'pending_payment'
    });
    
    console.log('✅ Order created with ID:', order.id);
    
    // Create order items
    const orderItems = await Promise.all(
      items.map(item => {
        console.log('📦 Creating order item:', {
          orderId: order.id,
          productId: item.Product?.id,
          qty: item.qty,
          price: item.Product?.price
        });
        
        return OrderItem.create({
          orderId: order.id,
          productId: item.Product?.id || item.productId,
          qty: parseInt(item.qty),
          price: parseFloat(item.Product?.price || item.price)
        });
      })
    );
    
    console.log('✅ Created', orderItems.length, 'order items');
    
    // Return success
    res.json({
      id: order.id,
      paymentReference: order.paymentReference,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: orderItems.length
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message
    });
  }
});

// Get orders by user (no auth required for testing)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('📋 Fetching orders for user:', userId);
    
    const orders = await Order.findAll({
      where: { userId },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('✅ Found', orders.length, 'orders for user:', userId);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;