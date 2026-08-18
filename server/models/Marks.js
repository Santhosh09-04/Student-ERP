const mongoose = require("mongoose")

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    enum: ["Midterm", "Final", "Assignment", "Quiz", "Unit Test"],
    required: true,
  },
  term: {
    type: String,
    enum: ["Term 1", "Term 2", "Term 3", "Annual"],
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
  },
}, {
  timestamps: true,
})

// Auto-calculated fields via getters
marksSchema.virtual("percentage").get(function () {
  if (!this.maxMarks) return 0
  return Math.round((this.marksObtained / this.maxMarks) * 100)
})

marksSchema.virtual("grade").get(function () {
  const pct = this.percentage
  if (pct >= 90) return "A+"
  if (pct >= 80) return "A"
  if (pct >= 70) return "B"
  if (pct >= 60) return "C"
  if (pct >= 50) return "D"
  return "F"
})

marksSchema.set("toJSON", { virtuals: true })
marksSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Marks", marksSchema)