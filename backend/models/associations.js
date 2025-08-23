const MainCustomer = require("./MainCustomer");
const MainUser = require("./MainUser");
const MasterDeviceType = require('./MasterDeviceType');

// Associations
MainCustomer.belongsTo(MainUser, {
  foreignKey: "created_by",
  as: "createdUser",
});
MainCustomer.belongsTo(MasterDeviceType, {
  foreignKey: "device_type",
  as: "deviceType",
});

MainCustomer.belongsTo(MainUser, {
  foreignKey: "modified_by",
  as: "modifiedUser",
});

MainUser.hasMany(MainCustomer, {
  foreignKey: "created_by",
  as: "customers",
});

MasterDeviceType.hasMany(MainCustomer, {
  foreignKey: "device_type",
  as: "deviceTypeMaster",
});


module.exports = { MainCustomer, MainUser,MasterDeviceType };
