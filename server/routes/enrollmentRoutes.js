const express = require("express")
const User = require("../models/User")
const Student = require("../models/Student")
const { authenticateToken, authorize } = require("../middleware/authMiddleware")
const router = express.Router()

// @route   POST /api/enrollment
// @desc    Enroll a new student (admin only)
// @access  Private (Admin only)
router.post("/", authenticateToken, authorize(["admin"]), async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, section, contact, address, dateOfJoining } = req.body

    if (!name || !studentClass) {
      return res.status(400).json({ message: "Name and class are required" })
    }

    const year = new Date().getFullYear()
    const lastStudent = await Student.findOne().sort({ createdAt: -1 })
    let seq = 1
    if (lastStudent && lastStudent.enrollmentId) {
      const parts = lastStudent.enrollmentId.split("-")
      const lastNum = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastNum)) seq = lastNum + 1
    }
    const enrollmentId = `STD-${year}-${String(seq).padStart(3, "0")}`
    const defaultPassword = rollNo ? `S${rollNo}@${year}` : "Student@123"

    const user = new User({
      email: `${enrollmentId.toLowerCase()}@student.edu`,
      passwordHash: defaultPassword,
      role: "student",
      name,
    })
    await user.save()

    const student = new Student({
      userId: user._id,
      enrollmentId,
      rollNo,
      class: studentClass,
      section,
      contact,
      address,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
    })
    await student.save()

    res.status(201).json({
      message: "Student enrolled successfully",
      student: student.toObject(),
      credentials: { enrollmentId, defaultPassword },
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Enrollment ID already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router