require("dotenv").config()
const dns = require("dns")
try { dns.setServers(["8.8.8.8", "1.1.1.1"]) } catch (e) {}
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first")

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const studentRoutes = require("./routes/studentRoutes")
const adminRoutes = require("./routes/adminRoutes")
const enrollmentRoutes = require("./routes/enrollmentRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const marksRoutes = require("./routes/marksRoutes")
const announcementRoutes = require("./routes/announcementRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }))
app.use(express.json())

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err))
} else {
  console.warn("MONGODB_URI not set — skipping database connection")
}

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/enrollment", enrollmentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/marks", marksRoutes)
app.use("/api/announcements", announcementRoutes)

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Student ERP API", version: "1.0.0" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ message: "Internal server error" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})