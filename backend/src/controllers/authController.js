const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "Email is already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hashed, role: "user" });
    res.status(201).json({ token: createToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: createToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
};

exports.me = (req, res) => res.json({
  id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role
});
