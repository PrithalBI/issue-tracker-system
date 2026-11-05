const router = require("express").Router();
const { protect } = require("../middleware/auth");
const controller = require("../controllers/dashboardController");
router.get("/", protect, controller.summary);
module.exports = router;
