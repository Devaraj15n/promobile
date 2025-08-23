const MainUser = require('../models/MainUser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// 🔧 Helper: delete file safely
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const absolutePath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log('Deleted old file:', absolutePath);
    }
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};

// 🔧 Helper: Generate next employee_code
const generateEmployeeCode = async () => {
  const lastUser = await MainUser.findOne({
    order: [['id', 'DESC']]
  });

  if (!lastUser || !lastUser.employee_code) {
    return 'PR0001';
  }

  const lastCodeNum = parseInt(lastUser.employee_code.replace('PR', '')) || 0;
  const nextCode = 'PR' + String(lastCodeNum + 1).padStart(4, '0');

  return nextCode;
};

// ✅ Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await MainUser.findAll({
      where: {
        is_active: 1,
        user_type: { [Op.ne]: 1 } // "not equal to 1"
      },
      attributes: ['id', 'employee_code', 'user_name', 'image', 'created_date']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new user
exports.createUser = async (req, res) => {
  try {
    const { user_name, password, user_type = 2, created_by = null } = req.body;

    const employee_code = await generateEmployeeCode();
    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath = null;
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename; // Multer upload path
    }

    const newUser = await MainUser.create({
      employee_code,
      user_name,
      password: hashedPassword,
      user_type,
      image: imagePath,
      created_by,
      created_date: new Date(),
      is_active: 1
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update user (remove old image if replaced)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, password, modified_by } = req.body;

    const user = await MainUser.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user_name) user.user_name = user_name;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (req.file) {
      // delete old image if exists
      if (user.image) {
        deleteFile(user.image);
      }
      user.image = '/uploads/' + req.file.filename;
    }

    user.modified_by = modified_by;
    user.modified_date = new Date();

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Soft delete user (set is_active = 0 + remove image)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await MainUser.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // delete image if exists
    if (user.image) {
      deleteFile(user.image);
    }

    user.is_active = 0;
    await user.save();

    res.json({ message: 'User deactivated successfully and image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
