const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MainUser = require("../models/MainUser");
const EmployeeLoginDetails = require("../models/EmployeeLoginDetails");
const { getIo, getUserSockets } = require("../socket");
const activeSessions = {}; // Track { userId: [sessionTokens] }

exports.login = async (req, res) => {
  const { employee_code, password } = req.body;

  const user = await MainUser.findOne({ where: { employee_code, is_active: 1 } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const io = getIo();
  const userSockets = getUserSockets();

  // Check if user is already logged in
  if (user.is_logged_in) {
    const socketId = userSockets[user.id];
    if (socketId) {
      io.to(socketId).emit("forced_logout", {
        reason: "logged_in_elsewhere",
        timestamp: new Date().toISOString(),
      });
    }

    // Reset DB flag and active sessions
    await user.update({ is_logged_in: 0 });
    if (activeSessions[user.id]) delete activeSessions[user.id];
  }

  // Normal user flow (needs super admin approval)
  if (user.user_type !== 1) {
    const loginRequest = await EmployeeLoginDetails.create({
      user_id: user.id,
      login_date: new Date(),
      login_time: new Date(),
      approved_flag: 0,
      created_by: user.id,
      created_date: new Date(),
      is_active: 1,
    });

    io.emit("login_request", {
      loginId: loginRequest.id,
      avatar: user.image,
      code: user.employee_code,
      user_id: user.id,
      user_name: user.user_name,
    });

    return res.json({
      message: "Awaiting super admin approval",
      loginId: loginRequest.id,
      user_id: user.id,
    });
  }

  // Super admin flow
  const token = jwt.sign(
    { id: user.id, user_name: user.user_name, user_type: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Mark user as logged in
  await user.update({ is_logged_in: 1 });

  // Track session
  if (!activeSessions[user.id]) activeSessions[user.id] = [];
  activeSessions[user.id].push(token);

  res.json({
    message: "Login successful",
    token,
    user,
  });
};

exports.approveLogin = async ({ loginId, approved, superAdminId }) => {
  const login = await EmployeeLoginDetails.findByPk(loginId);
  if (!login) return;

  await login.update({
    approved_flag: approved ? 1 : -1,
    modified_by: superAdminId,
    modified_date: new Date(),
  });

  const user = await MainUser.findByPk(login.user_id);
  if (!user) return;

  let payload = { approved: false };

  if (approved) {
    const token = jwt.sign(
      { id: user.id, user_name: user.user_name, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    payload = { approved: true, token, user };

    // Mark user as logged in
    await user.update({ is_logged_in: 1 });

    // Track session
    if (!activeSessions[user.id]) activeSessions[user.id] = [];
    activeSessions[user.id].push(token);
  }

  const io = getIo();
  const userSockets = getUserSockets();
  const userSocketId = userSockets[login.user_id];

  if (userSocketId) {
    io.to(userSocketId).emit("login_response", payload);
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await MainUser.findByPk(decoded.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.update({ is_logged_in: 0 });

  if (activeSessions[user.id]) {
    activeSessions[user.id] = activeSessions[user.id].filter((t) => t !== token);
    if (activeSessions[user.id].length === 0) delete activeSessions[user.id];
  }

  res.json({ success: true });
};
