import { DataTypes } from 'sequelize';
import { db } from '../config/database.js';

export const CartItem = db.define('cartItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
});