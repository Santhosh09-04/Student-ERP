const express = require("express")
const Announcement = require("../models/Announcement")
const { authenticateToken } = require("../middleware/authMiddleware")
const router = express.Router()

// @route   GET /api/announcements
// @desc    Get announcements visible to students
// @access  Private (authenticated)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const announcements = await Announcement.find(filter)
      .sort({ date: -1 })
      .limit(50)
      .populate("postedBy", "name")

    res.json(announcements)
  } catch (error) {
    console.error("Get announcements error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router