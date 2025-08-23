const http = require("http");
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth");
const { init } = require("./socket");
const path = require('path');
const deviceTypesRouter = require('./routes/deviceTypes');
const customersRouter = require('./routes/customers');
const userRouter = require('./routes/users');
const router = express.Router();


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/device-types", deviceTypesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/users", userRouter);
// router.get('/sessions/:userId', async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const sessionCount = activeSessions[userId]?.length || 0;
//         res.json({ activeSessions: sessionCount });
//     } catch (error) {
//         res.status(500).json({ message: "Error checking sessions" });
//     }
// });

sequelize.sync().then(() => console.log("✅ Database synced"));

const server = http.createServer(app);
init(server); // 👈 initialize socket.io here

server.listen(5000, () => console.log("🚀 Server running on 5000"));
