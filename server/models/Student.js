const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  enrollmentId: {
    type: String,
    required: [true, "Enrollment ID is required"],
    unique: true,
  },
  rollNo: {
    type: String,
  },
  class: {
    type: String,
    required: [true, "Class is required"],
  },
  section: {
    type: String,
  },
  contact: {
    type: String,
  },
  address: {
    type: String,
  },
  photoUrl: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Student", studentSchema)