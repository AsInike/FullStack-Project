import { DataTypes } from 'sequelize';
import { db } from '../config/database.js';

export const Product = db.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/150x150?text=No+Image'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  }
});