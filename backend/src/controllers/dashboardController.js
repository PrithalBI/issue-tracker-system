const Issue = require("../models/Issue");

exports.summary = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };
    const [total, open, inProgress, closed] = await Promise.all([
      Issue.countDocuments(filter),
      Issue.countDocuments({ ...filter, status: "Open" }),
      Issue.countDocuments({ ...filter, status: "In Progress" }),
      Issue.countDocuments({ ...filter, status: "Closed" })
    ]);
    res.json({ total, open, inProgress, closed });
  } catch (error) { next(error); }
};
