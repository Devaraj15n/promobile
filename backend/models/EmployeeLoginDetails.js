const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // your sequelize instance

const EmployeeLoginDetails = sequelize.define('employee_login_details', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  login_date: { type: DataTypes.DATEONLY },
  login_time: { type: DataTypes.TIME },
  approved_flag: { type: DataTypes.TINYINT },
  created_by: { type: DataTypes.INTEGER },
  modified_by: { type: DataTypes.INTEGER },
  created_date: { type: DataTypes.DATE },
  modified_date: { type: DataTypes.DATE },
  is_active: { type: DataTypes.TINYINT },
}, {
  tableName: 'employee_login_details',
  timestamps: false
});

module.exports = EmployeeLoginDetails;
