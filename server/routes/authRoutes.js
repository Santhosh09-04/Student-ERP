const express = require("express")
const User = require("../models/User")
const Student = require("../models/Student")
const Otp = require("../models/Otp")
const { generateToken } = require("../utils/jwt")
const { authenticateToken } = require("../middleware/authMiddleware")
const { sendOtpEmail } = require("../utils/emailService")
const router = express.Router()

// @route   POST /api/auth/send-otp
// @desc    Send 6-digit OTP code to email
// @access  Public
router.post("/send-otp", async (req, res) => {
  try {
    const { email, purpose = "Student Sign Up" } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Valid email address is required" })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if email already registered when signing up
    if (purpose.toLowerCase().includes("signup")) {
      const existingUser = await User.findOne({ email: cleanEmail })
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" })
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save/update OTP in database
    await Otp.deleteMany({ email: cleanEmail, purpose })
    await Otp.create({ email: cleanEmail, otp, purpose })

    // Send Email
    await sendOtpEmail(cleanEmail, otp, purpose)

    res.json({
      message: `OTP sent successfully to ${cleanEmail}`,
      email: cleanEmail,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    res.status(500).json({ message: "Failed to send OTP" })
  }
})

// @route   POST /api/auth/verify-otp
// @desc    Verify 6-digit OTP code
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose = "Verification" } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const cleanEmail = email.trim().toLowerCase()
    const validOtp = await Otp.findOne({ email: cleanEmail, otp: otp.trim() })

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP code" })
    }

    res.json({ success: true, message: "OTP verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Server error during OTP verification" })
  }
})

// @route   POST /api/auth/student-signup
// @desc    Student sign up with email OTP verification
// @access  Public
router.post("/student-signup", async (req, res) => {
  try {
    const { name, email, password, class: studentClass, section, contact, rollNo, otp } = req.body

    if (!name || !email || !password || !studentClass || !otp) {
      return res.status(400).json({ message: "Name, email, password, class, and OTP are required" })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ email: cleanEmail, otp: otp.trim() })
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP code. Please request a new OTP." })
    }

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email: cleanEmail })
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" })
    }

    // 3. Auto-generate enrollment ID (STD-YYYY-XXX)
    const year = new Date().getFullYear()
    const lastStudent = await Student.findOne().sort({ _id: -1 })
    let seq = 1
    if (lastStudent && lastStudent.enrollmentId) {
      const parts = lastStudent.enrollmentId.split("-")
      const lastNum = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastNum)) seq = lastNum + 1
    }
    const enrollmentId = `STD-${year}-${String(seq).padStart(3, "0")}`

    // 4. Create User
    const user = new User({
      email: cleanEmail,
      passwordHash: password,
      role: "student",
      name: name.trim(),
    })
    await user.save()

    // 5. Create Student record
    const student = new Student({
      userId: user._id,
      enrollmentId,
      rollNo: rollNo ? rollNo.trim() : "",
      class: studentClass.trim(),
      section: section ? section.trim() : "A",
      contact: contact ? contact.trim() : "",
    })
    await student.save()

    // 6. Delete used OTP
    await Otp.deleteMany({ email: cleanEmail })

    // 7. Generate Token
    const token = generateToken(user)

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      message: "Registration successful! Welcome to Student ERP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: student.enrollmentId,
        class: student.class,
        section: student.section,
      },
      token,
    })
  } catch (error) {
    console.error("Student signup error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
})

// @route   POST /api/auth/admin-signup
// @desc    Admin sign up with email OTP verification
// @access  Public
router.post("/admin-signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "Name, email, password, and OTP are required" })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ email: cleanEmail, otp: otp.trim() })
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP code. Please request a new OTP." })
    }

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email: cleanEmail })
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" })
    }

    // 3. Create Admin User
    const user = new User({
      email: cleanEmail,
      passwordHash: password,
      role: "admin",
      name: name.trim(),
    })
    await user.save()

    // 4. Delete used OTP
    await Otp.deleteMany({ email: cleanEmail })

    // 5. Generate Token
    const token = generateToken(user)

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      message: "Admin registration successful! Welcome to Student ERP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Admin signup error:", error)
    res.status(500).json({ message: "Server error during admin registration" })
  }
})

// @route   POST /api/auth/student-login
// @desc    Student login with enrollment ID OR Email + password
// @access  Public
router.post("/student-login", async (req, res) => {
  try {
    const { enrollmentId, email, password } = req.body
    const identifier = (enrollmentId || email || "").trim()

    if (!identifier || !password) {
      return res.status(400).json({ message: "Enrollment ID or email, and password are required" })
    }

    let user = null
    let student = null

    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier.toLowerCase(), role: "student" })
      if (user) {
        student = await Student.findOne({ userId: user._id })
      }
    } else {
      student = await Student.findOne({ enrollmentId: identifier })
      if (student) {
        user = await User.findById(student.userId)
      }
    }

    if (!user || !student) {
      return res.status(401).json({ message: "Invalid enrollment ID/email or password" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid enrollment ID/email or password" })
    }

    const token = generateToken(user)

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: student.enrollmentId,
        class: student.class,
        section: student.section,
      },
      token,
    })
  } catch (error) {
    console.error("Student login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// @route   POST /api/auth/admin-login
// @desc    Admin login with 2-Step Email OTP verification
// @access  Public
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password, otp } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const cleanEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: cleanEmail, role: "admin" })
    if (!user) {
      return res.status(401).json({ message: "Invalid admin email or password" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin email or password" })
    }

    // Step 1: If OTP not provided yet, send OTP code to admin email
    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      await Otp.deleteMany({ email: cleanEmail, purpose: "Admin Login Verification" })
      await Otp.create({ email: cleanEmail, otp: generatedOtp, purpose: "Admin Login Verification" })

      await sendOtpEmail(cleanEmail, generatedOtp, "Admin Login Verification")

      return res.status(200).json({
        requireOtp: true,
        email: cleanEmail,
        message: `OTP verification code sent to ${cleanEmail}`,
      })
    }

    // Step 2: Verify OTP code
    const validOtp = await Otp.findOne({ email: cleanEmail, otp: otp.trim() })
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP code" })
    }

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail })

    // Generate JWT Token
    const token = generateToken(user)

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message: "Admin login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    let extra = {}
    if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id })
      if (student) {
        extra = {
          enrollmentId: student.enrollmentId,
          class: student.class,
          section: student.section,
          photoUrl: student.photoUrl,
        }
      }
    }

    res.json({ user: { ...user.toSafeJSON(), ...extra } })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/auth/logout
// @desc    User logout
// @access  Private
router.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("jwt")
  res.status(200).json({ message: "Logout successful" })
})

// @route   POST /api/auth/forgot-password/send-otp
// @desc    Send 6-digit OTP to user email for password reset (Student or Admin)
// @access  Public
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    let bodyData = req.body
    if (typeof bodyData === "string") {
      try { bodyData = JSON.parse(bodyData) } catch (e) {}
    }

    const { identifier, role } = bodyData || {}
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return res.status(400).json({ message: "Please provide your registered Email or Enrollment ID" })
    }

    const cleanInput = identifier.trim()
    let user = null
    let userEmail = ""

    if (cleanInput.includes("@")) {
      userEmail = cleanInput.toLowerCase()
      if (role) {
        user = await User.findOne({ email: userEmail, role })
      }
      if (!user) {
        user = await User.findOne({ email: userEmail })
      }
    } else {
      // Look up by Enrollment ID (Students)
      const student = await Student.findOne({ enrollmentId: cleanInput })
      if (student) {
        user = await User.findById(student.userId)
        if (user) userEmail = user.email
      }
    }

    if (!user) {
      return res.status(404).json({ message: "No account found matching this Email or Enrollment ID" })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const purpose = "Password Reset"

    // Save/update OTP in database
    await Otp.deleteMany({ email: userEmail, purpose })
    await Otp.create({ email: userEmail, otp, purpose })

    // Send Email
    await sendOtpEmail(userEmail, otp, "Password Reset Code")

    // Obfuscate email for security response (e.g. s***h@gmail.com)
    const [localPart, domain] = userEmail.split("@")
    const obfuscatedLocal = localPart.length > 2 
      ? localPart[0] + "***" + localPart[localPart.length - 1] 
      : localPart[0] + "***"
    const maskedEmail = `${obfuscatedLocal}@${domain}`

    res.json({
      success: true,
      message: `Password reset OTP sent to ${maskedEmail}`,
      email: userEmail,
      maskedEmail,
    })
  } catch (error) {
    console.error("Forgot password send-otp error:", error)
    res.status(500).json({ message: error.message || "Failed to send password reset code. Please try again." })
  }
})


// @route   POST /api/auth/forgot-password/reset
// @desc    Verify OTP and reset password (Student or Admin)
// @access  Public
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" })
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    // Verify OTP
    const validOtp = await Otp.findOne({ email: cleanEmail, otp: cleanOtp, purpose: "Password Reset" })
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP code. Please request a new code." })
    }

    // Find User
    const user = await User.findOne({ email: cleanEmail })
    if (!user) {
      return res.status(404).json({ message: "User account not found" })
    }

    // Update password
    user.passwordHash = newPassword.trim()
    await user.save()

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail, purpose: "Password Reset" })

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Forgot password reset error:", error)
    res.status(500).json({ message: "Server error during password reset" })
  }
})


// @route   POST /api/auth/change-password
// @desc    Change own password
// @access  Private
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    user.passwordHash = newPassword
    await user.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router