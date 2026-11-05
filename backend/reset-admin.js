
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

async function resetAdmin() {
  try {
    const newEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const newPassword = process.env.ADMIN_PASSWORD;
    const newName = process.env.ADMIN_NAME || "System Admin";

    if (!newEmail || !newPassword) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing");
    }

    if (newPassword.length < 12) {
      throw new Error("Use a password with at least 12 characters");
    }

    await connectDB();

    // Find the existing admin account.
    const admin = await User.findOne({ role: "admin" });

    // Check that the new email is not used by another account.
    const emailOwner = await User.findOne({ email: newEmail });

    if (emailOwner && (!admin || !emailOwner._id.equals(admin._id))) {
      throw new Error("This email is already used by another account");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    if (admin) {
      admin.name = newName;
      admin.email = newEmail;
      admin.password = hashedPassword;
      admin.role = "admin";

      await admin.save();
      console.log("Admin email and password updated successfully.");
    } else {
      await User.create({
        name: newName,
        email: newEmail,
        password: hashedPassword,
        role: "admin"
      });

      console.log("New admin account created successfully.");
    }
  } catch (error) {
    console.error("Admin reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

resetAdmin();
