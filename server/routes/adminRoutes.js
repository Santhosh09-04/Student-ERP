const express = require("express")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const Student = require("../models/Student")
const Attendance = require("../models/Attendance")
const Marks = require("../models/Marks")
const Announcement = require("../models/Announcement")
const { authenticateToken, authorize } = require("../middleware/authMiddleware")
const router = express.Router()

// All admin routes require an authenticated admin
router.use(authenticateToken, authorize(["admin"]))

// @route   GET /api/admin/dashboard/stats
// @desc    Dashboard summary statistics
// @access  Private (Admin only)
router.get("/dashboard/stats", async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalStudents, attendanceToday, announcements, avgPercentAgg] = await Promise.all([
      Student.countDocuments(),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Announcement.countDocuments(),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
    ])

    const avgPerformance = avgPercentAgg.length
      ? Math.round((avgPercentAgg[0].present / avgPercentAgg[0].total) * 100)
      : 0

    const recentUpdates = await Announcement.find().sort({ date: -1 }).limit(5)

    res.json({
      totalStudents,
      attendanceToday,
      avgPerformance,
      recentUpdates: recentUpdates.map((a) => ({
        id: a._id,
        title: a.title,
        category: a.category,
        date: a.date,
      })),
    })
  } catch (error) {
    console.error("Admin dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/students
// @desc    List all students (searchable/sortable/paginated)
// @access  Private (Admin only)
router.get("/students", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, sortBy = "enrollmentId", order = "asc" } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    const filter = search
      ? {
          $or: [
            { enrollmentId: searchRegex },
            { class: searchRegex },
            { section: searchRegex },
          ],
        }
      : {}

    const students = await Student.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Student.countDocuments(filter)

    // Enrich with user name/email/photoUrl for the returned page
    const enriched = await Promise.all(
      students.map(async (s) => {
        const user = await User.findById(s.userId).select("name email role photoUrl")
        const photo = s.photoUrl || (user && user.photoUrl) || ""
        return { ...s.toObject(), photoUrl: photo, user: user || null }
      })
    )

    res.json({ students: enriched, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (error) {
    console.error("Get students error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/students
// @desc    Enroll a new student (auto-generates enrollment ID + default password)
// @access  Private (Admin only)
router.post("/students", async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, section, contact, address, dateOfJoining, photoUrl } = req.body

    if (!name || !studentClass) {
      return res.status(400).json({ message: "Name and class are required" })
    }

    // Auto-generate enrollment ID: STD-<YYYY>-<seq>
    const year = new Date().getFullYear()
    const lastStudent = await Student.findOne().sort({ createdAt: -1 })
    let seq = 1
    if (lastStudent && lastStudent.enrollmentId) {
      const parts = lastStudent.enrollmentId.split("-")
      const lastNum = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastNum)) seq = lastNum + 1
    }
    const enrollmentId = `STD-${year}-${String(seq).padStart(3, "0")}`

    // Default password derived from rollNo or "Student@123"
    const defaultPassword = rollNo ? `S${rollNo}@${year}` : "Student@123"

    const user = new User({
      email: `${enrollmentId.toLowerCase()}@student.edu`,
      passwordHash: defaultPassword, // hashed by pre-save hook
      role: "student",
      name,
      photoUrl: photoUrl || "",
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
      photoUrl: photoUrl || "",
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
    })
    await student.save()

    res.status(201).json({
      message: "Student enrolled successfully",
      student: student.toObject(),
      credentials: { enrollmentId, defaultPassword },
    })
  } catch (error) {
    console.error("Add student error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Enrollment ID already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})
// @route   GET /api/admin/students/:id
// @desc    Get single student profile
// @access  Private (Admin only)
router.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("userId", "name email role photoUrl")
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }
    res.json(student)
  } catch (error) {
    console.error("Get student error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/students/:id
// @desc    Update student record
// @access  Private (Admin only)
router.put("/students/:id", async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, section, contact, address, photoUrl } = req.body
    const updateData = { rollNo, class: studentClass, section, contact, address }
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const userUpdates = {}
    if (name) userUpdates.name = name
    if (photoUrl !== undefined) userUpdates.photoUrl = photoUrl

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(student.userId, userUpdates)
    }

    res.json(student)
  } catch (error) {
    console.error("Update student error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/admin/students/:id
// @desc    Delete student record
// @access  Private (Admin only)
router.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }
    // Clean up associated user
    await User.findByIdAndDelete(student.userId)
    res.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Delete student error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/attendance
// @desc    Get attendance records (filter by date/class/section)
// @access  Private (Admin only)
router.get("/attendance", async (req, res) => {
  try {
    const { date, class: studentClass, section } = req.query
    const filter = {}
    if (date) {
      const d = new Date(date)
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) }
    }

    let students = await Student.find({ ...(studentClass && { class: studentClass }), ...(section && { section }) })

    const records = await Promise.all(
      students.map(async (s) => {
        let att = null
        if (filter.date) att = await Attendance.findOne({ studentId: s._id, ...filter })
        else att = await Attendance.findOne({ studentId: s._id }).sort({ date: -1 })
        const user = await User.findById(s.userId).select("name photoUrl")
        return {
          studentId: s._id,
          enrollmentId: s.enrollmentId,
          name: user ? user.name : "Unknown",
          photoUrl: s.photoUrl || (user && user.photoUrl) || "",
          class: s.class,
          section: s.section,
          date: att ? att.date : null,
          status: att ? att.status : "not-marked",
        }
      })
    )

    res.json(records)
  } catch (error) {
    console.error("Get attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/attendance
// @desc    Mark attendance for one student
// @access  Private (Admin only)
router.post("/attendance", async (req, res) => {
  try {
    const { studentId, date, status } = req.body

    if (!studentId || !date || !status) {
      return res.status(400).json({ message: "studentId, date and status are required" })
    }
    if (!["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ message: "Status must be present, absent or late" })
    }

    const attDate = new Date(date)
    attDate.setHours(0, 0, 0, 0)

    const record = await Attendance.findOneAndUpdate(
      { studentId, date: { $gte: attDate, $lt: new Date(attDate.getTime() + 24 * 60 * 60 * 1000) } },
      { studentId, date: attDate, status, markedBy: req.user.id },
      { upsert: true, new: true }
    )

    res.json({ message: "Attendance marked successfully", record })
  } catch (error) {
    console.error("Mark attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/attendance/export
// @desc    Export attendance as CSV
// @access  Private (Admin only)
router.get("/attendance/export", async (req, res) => {
  try {
    const { date, class: studentClass } = req.query
    const filter = {}
    if (date) {
      const d = new Date(date)
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) }
    }

    let students = await Student.find(studentClass ? { class: studentClass } : {})

    const rows = await Promise.all(
      students.map(async (s) => {
        let att = null
        if (filter.date) att = await Attendance.findOne({ studentId: s._id, ...filter })
        else att = await Attendance.findOne({ studentId: s._id }).sort({ date: -1 })
        const user = await User.findById(s.userId).select("name")
        return {
          EnrollmentId: s.enrollmentId,
          Name: user ? user.name : "Unknown",
          Class: s.class,
          Section: s.section || "",
          Date: att ? att.date.toISOString().split("T")[0] : "",
          Status: att ? att.status : "not-marked",
        }
      })
    )

    const header = "EnrollmentId,Name,Class,Section,Date,Status"
    const csv = [header, ...rows.map((r) => [r.EnrollmentId, `"${r.Name}"`, r.Class, r.Section, r.Date, r.Status].join(","))].join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=attendance.csv")
    res.send(csv)
  } catch (error) {
    console.error("Export attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/marks
// @desc    Get marks records (filter by student/subject/term)
// @access  Private (Admin only)
router.get("/marks", async (req, res) => {
  try {
    const { studentId, subject, term } = req.query
    const filter = {}
    if (studentId) filter.studentId = studentId
    if (subject) filter.subject = subject
    if (term) filter.term = term

    const marks = await Marks.find(filter).sort({ createdAt: -1 })
    res.json(marks)
  } catch (error) {
    console.error("Get marks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/marks
// @desc    Add/update marks (auto-calculates percentage & grade)
// @access  Private (Admin only)
router.post("/marks", async (req, res) => {
  try {
    const { studentId, subject, examType, term, marksObtained, maxMarks } = req.body

    if (!studentId || !subject || !examType || !term || marksObtained === undefined || maxMarks === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const percentage = Math.round((marksObtained / maxMarks) * 100)
    let grade = "F"
    if (percentage >= 90) grade = "A+"
    else if (percentage >= 80) grade = "A"
    else if (percentage >= 70) grade = "B"
    else if (percentage >= 60) grade = "C"
    else if (percentage >= 50) grade = "D"

    // Upsert to avoid duplicates for same student/subject/exam/term
    const record = await Marks.findOneAndUpdate(
      { studentId, subject, examType, term },
      { studentId, subject, examType, term, marksObtained, maxMarks },
      { upsert: true, new: true }
    )

    res.json({ message: "Marks saved", record, percentage, grade })
  } catch (error) {
    console.error("Add marks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/admin/marks/:id
// @desc    Delete a marks record
// @access  Private (Admin only)
router.delete("/marks/:id", async (req, res) => {
  try {
    const record = await Marks.findByIdAndDelete(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Marks record not found" })
    }
    res.json({ message: "Marks record deleted" })
  } catch (error) {
    console.error("Delete marks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/announcements
// @desc    Get all announcements
// @access  Private (Admin only)
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 }).populate("postedBy", "name")
    res.json(announcements)
  } catch (error) {
    console.error("Get announcements error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/announcements
// @desc    Post a new announcement
// @access  Private (Admin only)
router.post("/announcements", async (req, res) => {
  try {
    const { title, description, category } = req.body

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description and category are required" })
    }

    const announcement = new Announcement({
      title,
      description,
      category,
      postedBy: req.user.id,
    })
    await announcement.save()

    res.status(201).json(announcement)
  } catch (error) {
    console.error("Post announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/admin/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin only)
router.delete("/announcements/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }
    res.json({ message: "Announcement deleted" })
  } catch (error) {
    console.error("Delete announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/profile
// @desc    Update admin profile (Name & Photo)
// @access  Private (Admin only)
router.put("/profile", async (req, res) => {
  try {
    const { name, photoUrl } = req.body
    const updates = {}
    if (name) updates.name = name
    if (photoUrl !== undefined) updates.photoUrl = photoUrl

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-passwordHash")
    res.json({
      message: "Admin profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    })
  } catch (error) {
    console.error("Update admin profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router