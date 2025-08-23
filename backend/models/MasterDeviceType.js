// models/MasterDeviceType.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MasterDeviceType = sequelize.define('MasterDeviceType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  is_active: DataTypes.BOOLEAN,
}, {
  tableName: 'master_device_type',
  timestamps: false,
});

module.exports = MasterDeviceType;
