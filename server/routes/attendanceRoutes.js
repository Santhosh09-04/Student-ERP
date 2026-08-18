const express = require("express")
const Student = require("../models/Student")
const Attendance = require("../models/Attendance")
const { authenticateToken } = require("../middleware/authMiddleware")
const router = express.Router()

// @route   GET /api/attendance
// @desc    Get own attendance records + percentage
// @access  Private (Student only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Students only." })
    }
    const student = await Student.findOne({ userId: req.user.id })
    if (!student) {
      return res.status(404).json({ message: "Student record not found" })
    }

    const { month } = req.query
    const filter = { studentId: student._id }
    if (month) {
      const start = new Date(`${month}-01`)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      filter.date = { $gte: start, $lt: end }
    }

    const records = await Attendance.find(filter).sort({ date: 1 })

    // Build calendar view (one record per day)
    const calendar = {}
    for (const r of records) {
      const key = r.date.toISOString().split("T")[0]
      calendar[key] = r.status
    }

    const present = records.filter((r) => ["present", "late"].includes(r.status)).length
    const percentage = records.length ? Math.round((present / records.length) * 100) : 0

    res.json({ records, calendar, percentage, totalDays: records.length, presentDays: present })
  } catch (error) {
    console.error("Get attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router