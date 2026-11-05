
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const issueRoutes = require("./src/routes/issueRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const User = require("./src/models/User");

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
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

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

// =====================================
// HEALTH CHECK ROUTES
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "issue-tracker-api",
    message: "Backend is running successfully"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "issue-tracker-api"
  });
});

// =====================================
// DATABASE INITIALIZATION
// =====================================

let initializationPromise;

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await connectDB();

      // Create initial admin if configured
      if (
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_PASSWORD
      ) {
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
            role: "admin"
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

// =====================================
// DATABASE MIDDLEWARE
// =====================================

app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);

    res.status(503).json({
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "production"
          ? "Service temporarily unavailable"
          : error.message
    });
  }
});

// =====================================
// API ROUTES
// =====================================

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl
  });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

// =====================================
// LOCAL SERVER
// =====================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  initializeDatabase()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}

// =====================================
// VERCEL EXPORT
// =====================================

module.exports = app;
