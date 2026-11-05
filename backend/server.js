require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const issueRoutes = require("./src/routes/issueRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const User = require("./src/models/User");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server requests and configured browser origins.
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "issue-tracker-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add a strong secret to backend/.env");
}
connectDB().then(async () => {
  // Create an initial admin account once, when configured.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (!exists) {
      const bcrypt = require("bcryptjs");
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password,
        role: "admin"
      });
      console.log("Initial admin account created.");
    }
  }
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
