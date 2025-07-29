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
    
    const { userId, items, total, deliveryLocation, paymentReference, paymentStatus, isFreeDrink } = req.body;
    
    // Validate required fields
    if (!userId || !items || !paymentReference) {
      console.log('❌ Missing required fields:', { userId, itemsCount: items?.length, paymentReference });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'userId, items, and paymentReference are required'
      });
    }
    
    console.log('📝 Creating order for user:', userId, 'with total:', total, 'isFreeDrink:', isFreeDrink);
    
    // Handle free drink orders
    if (isFreeDrink) {
      console.log('🎁 Processing FREE DRINK order for user:', userId);
      
      // Verify user has enough points for free drink
      const { User } = await import('../models/index.js');
      const user = await User.findByPk(userId);
      
      if (!user) {
        console.log('❌ User not found:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('👤 User current points:', user.points);
      
      if (user.points < 10) {
        console.log('❌ Insufficient points for free drink. User has:', user.points, 'but needs 10');
        return res.status(400).json({ 
          error: 'Insufficient points for free drink',
          currentPoints: user.points 
        });
      }
      
      // Deduct points for free drink
      const oldPoints = user.points;
      await user.update({ points: oldPoints - 10 });
      
      // Refresh user data to get the updated points
      await user.reload();
      const newPoints = user.points;
      
      console.log('💰 Points deduction completed:', {
        oldPoints,
        deducted: 10,
        newPoints,
        userId,
        verification: `${oldPoints} - 10 = ${newPoints}`
      });
    }
    
    // Create order
    const order = await Order.create({
      userId: parseInt(userId),
      total: parseFloat(total) || 0,
      deliveryLocation: deliveryLocation ? JSON.stringify(deliveryLocation) : null,
      paymentReference,
      paymentStatus: isFreeDrink ? 'verified' : (paymentStatus || 'pending_verification'),
      status: isFreeDrink ? 'approved' : 'pending', // Use 'approved' instead of 'confirmed'
      points: isFreeDrink ? 0 : undefined // Free drinks don't earn points
    });
    
    console.log('✅ Order created with ID:', order.id, isFreeDrink ? '(FREE DRINK)' : '');
    
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
          price: parseFloat(item.Product?.price || item.price || 0) // Default to 0 if price is undefined
        });
      })
    );
    
    console.log('✅ Created', orderItems.length, 'order items');
    
    // If this is a free drink, get the updated user data to return
    let updatedUser = null;
    if (isFreeDrink) {
      const { User } = await import('../models/index.js');
      updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'points', 'role'] // Only return safe user data
      });
    }
    
    // Return success
    res.json({
      id: order.id,
      paymentReference: order.paymentReference,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: orderItems.length,
      ...(isFreeDrink && updatedUser && { 
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          points: updatedUser.points,
          role: updatedUser.role
        }
      })
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

// Customer claims their own free drink
router.post('/claim-free-drink', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log('🍺 Customer claiming free drink:', { userId });
    
    // Get user and check if they have enough points
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.points < 10) {
      return res.status(400).json({ 
        error: 'Insufficient points. You need at least 10 points to claim a free drink.',
        currentPoints: user.points
      });
    }
    
    // Deduct 10 points
    const newPoints = user.points - 10;
    await user.update({ points: newPoints });
    
    console.log('Free drink claimed by customer:', {
      userId,
      oldPoints: user.points,
      newPoints,
      pointsDeducted: 10
    });
    
    res.json({ 
      message: 'Free drink claimed successfully!',
      pointsDeducted: 10,
      newPoints,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: newPoints,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Error claiming free drink:', error);
    res.status(500).json({ error: 'Failed to claim free drink' });
  }
});

export default router;