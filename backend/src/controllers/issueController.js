const Issue = require("../models/Issue");
const User = require("../models/User");

const populateIssue = (query) => query
  .populate("createdBy", "name email")
  .populate("assignedTo", "name email")
  .populate("comments.author", "name role");

exports.list = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };
    const issues = await populateIssue(Issue.find(filter).sort({ updatedAt: -1 }));
    res.json(issues);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    if (!title?.trim() || !description?.trim()) return res.status(400).json({ message: "Title and description are required" });
    const issue = await Issue.create({ title, description, priority, createdBy: req.user._id });
    res.status(201).json(await populateIssue(Issue.findById(issue._id)));
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    const isOwner = issue.createdBy.equals(req.user._id);
    const isAssignee = issue.assignedTo?.equals(req.user._id);
    if (req.user.role !== "admin" && !isOwner && !isAssignee) return res.status(403).json({ message: "Not allowed to update this issue" });

    const allowed = req.user.role === "admin"
      ? ["title", "description", "status", "priority"]
      : isOwner ? ["title", "description", "status", "priority"] : ["status"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) issue[key] = req.body[key];
    });
    await issue.save();
    res.json(await populateIssue(Issue.findById(issue._id)));
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (req.user.role !== "admin" && !issue.createdBy.equals(req.user._id)) return res.status(403).json({ message: "Only the creator or admin can delete this issue" });
    await issue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (error) { next(error); }
};

exports.assign = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = userId ? await User.findById(userId) : null;
    if (userId && (!user || user.role !== "user")) return res.status(400).json({ message: "Select a valid user account" });
    const issue = await Issue.findByIdAndUpdate(req.params.id, { assignedTo: user ? user._id : null }, { new: true, runValidators: true });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(await populateIssue(Issue.findById(issue._id)));
  } catch (error) { next(error); }
};

exports.comment = async (req, res, next) => {
  try {
    const message = req.body.message?.trim();
    if (!message) return res.status(400).json({ message: "Comment cannot be empty" });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    const allowed = req.user.role === "admin" || issue.createdBy.equals(req.user._id) || issue.assignedTo?.equals(req.user._id);
    if (!allowed) return res.status(403).json({ message: "Not allowed to comment on this issue" });
    issue.comments.push({ author: req.user._id, message });
    await issue.save();
    res.status(201).json(await populateIssue(Issue.findById(issue._id)));
  } catch (error) { next(error); }
};

exports.users = async (_req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("name email");
    res.json(users);
  } catch (error) { next(error); }
};
