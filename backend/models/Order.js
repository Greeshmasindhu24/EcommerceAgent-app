const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'delivered'),
    allowNull: false,
    defaultValue: 'pending',
  },
});

module.exports = Order;
