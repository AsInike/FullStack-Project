import express from 'express';
import { Cart, CartItem, Product } from '../models/index.js';

const router = express.Router();

// DEBUG: Get all carts and cart items
router.get('/debug/all', async (req, res) => {
  try {
    const carts = await Cart.findAll({
      include: [{
        model: CartItem,
        as: 'CartItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }]
    });
    
    const cartItems = await CartItem.findAll({
      include: [{
        model: Product,
        as: 'Product'
      }]
    });
    
    console.log('🐛 ALL CARTS:', JSON.stringify(carts, null, 2));
    console.log('🐛 ALL CART ITEMS:', JSON.stringify(cartItems, null, 2));
    
    res.json({
      carts: carts,
      cartItems: cartItems,
      cartsCount: carts.length,
      cartItemsCount: cartItems.length
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});
//clear user's cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('🧹 Clearing cart for user:', userId);
    
    // Find user's cart
    const cart = await Cart.findOne({ where: { userId } });
    
    if (!cart) {
      return res.json({ message: 'No cart found' });
    }
    
    // Delete all cart items
    await CartItem.destroy({
      where: { cartId: cart.id }
    });
    
    console.log('✅ Cart cleared successfully');
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, qty } = req.body;
    
    console.log('🛒 Adding to cart:', { userId, productId, qty });
    
    // Validate input
    if (!userId || !productId || !qty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('✅ Product found:', product.name);
    
    // Find or create user's cart
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      console.log('📦 Creating new cart for user:', userId);
      cart = await Cart.create({ userId });
    } else {
      console.log('📦 Found existing cart:', cart.id, 'for user:', userId);
    }
    
    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });
    
    if (cartItem) {
      console.log('📝 Updating existing cart item:', cartItem.id);
      cartItem.qty += parseInt(qty);
      await cartItem.save();
    } else {
      console.log('➕ Creating new cart item');
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: parseInt(productId),
        qty: parseInt(qty)
      });
    }
    
    // Fetch the created item with product details
    const savedItem = await CartItem.findByPk(cartItem.id, {
      include: [{
        model: Product,
        as: 'Product'
      }]
    });
    
    console.log('✅ Cart item saved:', savedItem.toJSON());
    res.json(savedItem);
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get cart items for user
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('🔍 Fetching cart for user:', userId);
    
    // First, check if user has a cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      console.log('📭 No cart found for user:', userId);
      return res.json([]);
    }
    
    console.log('📦 Found cart ID:', cart.id);
    
    // Get cart items with product details
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        as: 'Product'
      }]
    });
    
    console.log('📋 Found', cartItems.length, 'cart items');
    cartItems.forEach(item => {
      console.log(`   - ${item.Product?.name} (qty: ${item.qty}, price: $${item.Product?.price})`);
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update cart item quantity
router.put('/item/:cartItemId', async (req, res) => {
  try {
    const { qty } = req.body;
    const cartItemId = parseInt(req.params.cartItemId);
    console.log('📝 Updating cart item:', cartItemId, 'to qty:', qty);
    
    const cartItem = await CartItem.findByPk(cartItemId);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    cartItem.qty = parseInt(qty);
    await cartItem.save();
    
    console.log('✅ Cart item updated:', cartItem.toJSON());
    res.json(cartItem);
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/item/:cartItemId', async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.cartItemId);
    console.log('🗑️ Removing cart item:', cartItemId);
    
    const cartItem = await CartItem.findByPk(cartItemId);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    await cartItem.destroy();
    console.log('✅ Cart item removed');
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('❌ Error removing cart item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;