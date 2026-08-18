const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent", "late"],
    required: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
})

// A student can have only one attendance record per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", attendanceSchema)