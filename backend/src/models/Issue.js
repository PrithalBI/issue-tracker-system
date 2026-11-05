const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ["Open", "In Progress", "Closed"], default: "Open" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);
