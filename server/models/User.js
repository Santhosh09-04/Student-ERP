const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Invalid email format"],
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  photoUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role, name: this.name, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  )
}

// Utility to strip sensitive fields before sending to client
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

const User = mongoose.model("User", userSchema)
module.exports = User