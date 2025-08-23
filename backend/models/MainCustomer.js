const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MainCustomer = sequelize.define(
    "main_customers",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        customer_name: DataTypes.STRING(100),
        phone_number: DataTypes.STRING(15),
        device_type: DataTypes.INTEGER,
        warranty: DataTypes.STRING(100),
        model: DataTypes.STRING(100),
        repair_type: DataTypes.STRING(100),
        received_date: DataTypes.DATEONLY,
        delivery_date: DataTypes.DATEONLY,
        cost: DataTypes.DECIMAL(10, 2),
        invoice_number: DataTypes.STRING(50),
        created_by: DataTypes.INTEGER,
        modified_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_date: DataTypes.DATE,
        is_active: DataTypes.TINYINT,
    },
    {
        timestamps: false,
    }
);

module.exports = MainCustomer;
