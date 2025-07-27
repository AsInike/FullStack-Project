import { User } from './user.js';
import { Product } from './Product.js';
import { Cart } from './Cart.js';
import { CartItem } from './CartItem.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';

// User relationships
User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart relationships
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'CartItems' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// Product relationships
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'CartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

// Order relationships
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'OrderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

export { User, Product, Cart, CartItem, Order, OrderItem };