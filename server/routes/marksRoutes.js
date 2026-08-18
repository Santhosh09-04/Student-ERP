const express = require("express")
const Student = require("../models/Student")
const Marks = require("../models/Marks")
const { authenticateToken } = require("../middleware/authMiddleware")
const router = express.Router()

// Fallback demo marks for new students before admin publishes customized marks
const getInitialMarks = (studentId) => [
  { _id: `demo-${studentId}-1`, studentId, subject: "Mathematics", examType: "Midterm Exam", term: "Term 1", marksObtained: 88, maxMarks: 100, percentage: 88, grade: "A" },
  { _id: `demo-${studentId}-2`, studentId, subject: "Science & Technology", examType: "Midterm Exam", term: "Term 1", marksObtained: 92, maxMarks: 100, percentage: 92, grade: "A+" },
  { _id: `demo-${studentId}-3`, studentId, subject: "English Literature", examType: "Midterm Exam", term: "Term 1", marksObtained: 85, maxMarks: 100, percentage: 85, grade: "A" },
  { _id: `demo-${studentId}-4`, studentId, subject: "Social Studies", examType: "Midterm Exam", term: "Term 1", marksObtained: 79, maxMarks: 100, percentage: 79, grade: "B" },
  { _id: `demo-${studentId}-5`, studentId, subject: "Computer Science", examType: "Midterm Exam", term: "Term 1", marksObtained: 96, maxMarks: 100, percentage: 96, grade: "A+" },
]

// @route   GET /api/marks
// @desc    Get own marks across subjects/terms
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

    let marks = await Marks.find({ studentId: student._id }).sort({ term: 1, subject: 1 })

    // If student has no admin marks created yet, return standard curriculum subjects
    if (!marks || marks.length === 0) {
      marks = getInitialMarks(student._id)
    }

    // Term-wise summary
    const byTerm = marks.reduce((acc, m) => {
      if (!acc[m.term]) acc[m.term] = { total: 0, obtained: 0, subjects: [] }
      acc[m.term].total += m.maxMarks
      acc[m.term].obtained += m.marksObtained
      acc[m.term].subjects.push(m)
      return acc
    }, {})

    const termSummary = Object.entries(byTerm).map(([term, data]) => ({
      term,
      percentage: Math.round((data.obtained / data.total) * 100),
      subjects: data.subjects.length,
    }))

    res.json({ marks, termSummary })
  } catch (error) {
    console.error("Get marks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router