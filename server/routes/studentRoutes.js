const express = require("express")
const Student = require("../models/Student")
const User = require("../models/User")
const { authenticateToken, authorize } = require("../middleware/authMiddleware")
const router = express.Router()

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student only)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate("userId", "name email role")
    if (!student) {
      return res.status(404).json({ message: "Student record not found" })
    }
    res.json(student)
  } catch (error) {
    console.error("Get student profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Private (Student only)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, contact, address, photoUrl } = req.body
    let student = await Student.findOne({ userId: req.user.id })
    if (!student) {
      return res.status(404).json({ message: "Student record not found" })
    }

    if (contact !== undefined) student.contact = contact
    if (address !== undefined) student.address = address
    if (photoUrl !== undefined) student.photoUrl = photoUrl
    await student.save()

    const userUpdates = {}
    if (name) userUpdates.name = name
    if (photoUrl !== undefined) userUpdates.photoUrl = photoUrl

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates)
    }

    const updatedUser = await User.findById(req.user.id).select("-password")
    res.json({
      message: "Profile updated successfully!",
      student,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        photoUrl: updatedUser.photoUrl || student.photoUrl,
        enrollmentId: student.enrollmentId,
        class: student.class,
        section: student.section,
        contact: student.contact,
        address: student.address,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/students/attendance
router.get("/attendance", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
    if (!student) {
      return res.status(404).json({ message: "Student record not found" })
    }
    const attendanceRecords = [
      { date: "2024-06-01", status: "present" },
      { date: "2024-06-02", status: "present" },
      { date: "2024-06-03", status: "absent" },
      { date: "2024-06-04", status: "present" },
      { date: "2024-06-05", status: "present" },
    ]
    const presentCount = attendanceRecords.filter((r) => r.status === "present").length
    const percent = Math.round((presentCount / attendanceRecords.length) * 100)
    
    res.json({
      records: attendanceRecords,
      percentage: percent,
    })
  } catch (error) {
    console.error("Get student attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/students/marks
router.get("/marks", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
    if (!student) {
      return res.status(404).json({ message: "Student record not found" })
    }
    const marks = [
      { subject: "Mathematics", examType: "Midterm", term: "Term 1", marksObtained: 85, maxMarks: 100 },
      { subject: "Physics", examType: "Midterm", term: "Term 1", marksObtained: 90, maxMarks: 100 },
      { subject: "Chemistry", examType: "Midterm", term: "Term 1", marksObtained: 78, maxMarks: 100 },
    ]
    res.json(marks)
  } catch (error) {
    console.error("Get student marks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/students/performance
router.get("/performance", authenticateToken, async (req, res) => {
  try {
    const performance = {
      terms: ["Term 1", "Term 2", "Term 3"],
      scores: [75, 82, 88],
    }
    res.json(performance)
  } catch (error) {
    console.error("Get student performance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router