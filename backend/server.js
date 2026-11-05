
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const issueRoutes = require("./src/routes/issueRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const User = require("./src/models/User");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

app.use(express.json({ limit: "1mb" }));

// Connect to MongoDB and create the admin account if needed.
let initializationPromise;

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await connectDB();

      if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const email = process.env.ADMIN_EMAIL.toLowerCase();

        const exists = await User.findOne({ email });

        if (!exists) {
          const bcrypt = require("bcryptjs");
          const password = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
          );

          await User.create({
            name: process.env.ADMIN_NAME || "Admin",
            email,
            password,
            role: "admin",
          });

          console.log("Initial admin account created.");
        }
      }
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

// Ensure database is ready before handling requests.
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "issue-tracker-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Export Express app for Vercel.
module.exports = app;
