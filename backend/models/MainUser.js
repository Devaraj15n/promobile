const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MainUser = sequelize.define('main_users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_code: { type: DataTypes.STRING(10) },
    user_name: { type: DataTypes.STRING(50) },
    password: { type: DataTypes.STRING(255) },
    user_type: { type: DataTypes.INTEGER },
    image: { type: DataTypes.STRING(255) },
    created_by: { type: DataTypes.INTEGER },
    modified_by: { type: DataTypes.INTEGER },
    created_date: { type: DataTypes.DATE },
    modified_date: { type: DataTypes.DATE },
    is_active: { type: DataTypes.TINYINT },
    is_logged_in: { type: DataTypes.TINYINT },
}, {
    timestamps: false
});

module.exports = MainUser;
