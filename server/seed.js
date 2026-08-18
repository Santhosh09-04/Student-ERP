const mongoose = require("mongoose")
const User = require("./models/User")
const Student = require("./models/Student")
const Attendance = require("./models/Attendance")
const Marks = require("./models/Marks")
const Announcement = require("./models/Announcement")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/student_erp"

const students = [
  { name: "Alice Johnson", enrollmentId: "STD-2024-001", rollNo: "101", class: "10th Grade", section: "A", contact: "alice.johnson@email.com", address: "123 Student St, Cityville" },
  { name: "Bob Smith", enrollmentId: "STD-2024-002", rollNo: "102", class: "10th Grade", section: "B", contact: "bob.smith@email.com", address: "456 Scholar Ave, Townsburg" },
  { name: "Carol Williams", enrollmentId: "STD-2024-003", rollNo: "103", class: "11th Grade", section: "A", contact: "carol.williams@email.com", address: "789 Learner Blvd, Villagetown" },
  { name: "David Brown", enrollmentId: "STD-2024-004", rollNo: "104", class: "9th Grade", section: "C", contact: "david.brown@email.com", address: "321 Graduate Rd, Cityville" },
  { name: "Emma Davis", enrollmentId: "STD-2024-005", rollNo: "105", class: "10th Grade", section: "A", contact: "emma.davis@email.com", address: "654 Degree Ln, Townsburg" },
]

const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"]
const terms = ["Term 1", "Term 2"]

async function seedDatabase() {
  try {
    console.log(`Connecting to ${MONGODB_URI}...`)
    await mongoose.connect(MONGODB_URI)

    // Clear existing data
    await Promise.all([
      Student.deleteMany({}),
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Marks.deleteMany({}),
      Announcement.deleteMany({}),
    ])
    console.log("Cleared existing collections")

    // Create admin user
    const admin = new User({
      email: "admin@student.edu",
      passwordHash: "Admin@123",
      role: "admin",
      name: "System Administrator",
    })
    await admin.save()
    console.log("Created admin: admin@student.edu / Admin@123")

    const createdStudents = []
    for (const s of students) {
      const user = new User({
        email: `${s.enrollmentId.toLowerCase()}@student.edu`,
        passwordHash: "Student@123",
        role: "student",
        name: s.name,
      })
      await user.save()

      const student = new Student({ userId: user._id, ...s })
      await student.save()
      createdStudents.push(student)
      console.log(`Created student: ${s.name} (${s.enrollmentId}) / Student@123`)
    }

    // Seed attendance for the last 10 working days
    const today = new Date()
    for (let d = 0; d < 10; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - d)
      const dow = date.getDay()
      if (dow === 0 || dow === 6) continue // skip weekends

      for (const student of createdStudents) {
        const rand = Math.random()
        const status = rand < 0.82 ? "present" : rand < 0.94 ? "late" : "absent"
        await Attendance.create({ studentId: student._id, date, status, markedBy: admin._id })
      }
    }
    console.log("Seeded 10 days of attendance")

    // Seed marks
    for (const student of createdStudents) {
      for (const term of terms) {
        for (const subject of subjects) {
          const maxMarks = 100
          const marksObtained = Math.max(35, Math.min(99, Math.round(60 + Math.random() * 35)))
          await Marks.create({ studentId: student._id, subject, examType: "Midterm", term, marksObtained, maxMarks })
        }
      }
    }
    console.log("Seeded marks for all students")

    // Seed announcements
    const announcements = [
      { title: "Final Exam Schedule Released", description: "Final exams will begin on June 15. Check the exam section for the full timetable.", category: "Exam" },
      { title: "School Holiday Notice", description: "The school will remain closed on June 20 for the summer festival.", category: "Notice" },
      { title: "Math Homework — Chapter 5", description: "Complete exercises 5.1 to 5.5 from the textbook. Due by Friday.", category: "Homework" },
      { title: "Annual Sports Day", description: "Annual Sports Day will be held on July 1 at the main ground. Interested students can register at the front office.", category: "Event" },
    ]
    for (const a of announcements) {
      await Announcement.create({ ...a, postedBy: admin._id })
    }
    console.log("Seeded announcements")

    console.log("\n✅ Database seeded successfully!")
    console.log("\n--- Login Credentials ---")
    console.log("Admin:   admin@student.edu  /  Admin@123")
    console.log("Students: STD-2024-001 through STD-2024-005  /  Student@123")

    await mongoose.connection.close()
  } catch (error) {
    console.error("Error seeding database:", error)
    await mongoose.connection.close().catch(() => {})
    process.exit(1)
  }
}

seedDatabase()