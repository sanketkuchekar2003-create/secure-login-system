const express = require("express");
const { getRecentActivity, login, signup } = require("../controllers/authController");

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/activity", getRecentActivity);

module.exports = router;
