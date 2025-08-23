const express = require("express");
const router = express.Router();
// const MainCustomer = require("../models/MainCustomer");
const { MainCustomer, MainUser, MasterDeviceType } = require("../models/associations");


// Create Customer
router.post("/", async (req, res) => {
  try {
    const customer = await MainCustomer.create(req.body);
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create customer" });
  }
});

router.get("/", async (req, res) => {
  try {
    const customers = await MainCustomer.findAll({
      where: { is_active: 1 },
      order: [["created_date", "DESC"]],
      include: [
        { model: MainUser, as: "createdUser", attributes: ["id", "employee_code", "user_name"] },
        { model: MainUser, as: "modifiedUser", attributes: ["id", "employee_code", "user_name"] },
        { model: MasterDeviceType, as: "deviceType", attributes: ["name"] },
      ],
    });

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// ✅ Get Single Customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await MainCustomer.findByPk(req.params.id);
    if (!customer || customer.is_active === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// ✅ Update Customer
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await MainCustomer.update(req.body, {
      where: { id: req.params.id, is_active: 1 },
    });
    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const updatedCustomer = await MainCustomer.findByPk(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// ✅ Soft Delete Customer
router.delete("/:id", async (req, res) => {
  try {
    const [deleted] = await MainCustomer.update(
      { is_active: 0 },
      { where: { id: req.params.id } }
    );
    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

module.exports = router;
