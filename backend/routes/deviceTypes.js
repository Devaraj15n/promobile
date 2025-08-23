// routes/deviceTypes.js
const express = require('express');
const router = express.Router();
const  MasterDeviceType  = require('../models/MasterDeviceType'); // adjust path as needed

// GET /api/device-types
router.get('/', async (req, res) => {
  try {
    const deviceTypes = await MasterDeviceType.findAll({
      where: { is_active: true },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(deviceTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching device types" });
  }
});

module.exports = router;
