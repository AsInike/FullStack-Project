import { DataTypes } from 'sequelize';
import { db } from '../config/database.js';

export const Cart = db.define('cart', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }
});