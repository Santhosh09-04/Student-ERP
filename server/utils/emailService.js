const nodemailer = require("nodemailer")

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.replace(/\s+/g, ""),
      },
    })
  }
  return null
}

/**
 * Send OTP verification email
 * @param {string} email
 * @param {string} otp
 * @param {string} purpose
 */
const sendOtpEmail = async (email, otp, purpose = "Student Sign Up") => {
  const transporter = createTransporter()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4f46e5; margin: 0;">Student ERP</h2>
        <p style="color: #64748b; font-size: 14px;">Enrollment & Resource Planning System</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="color: #334155; font-size: 16px; margin-top: 0;">Your Verification OTP for <strong>${purpose}</strong> is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 15px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
        If you did not request this OTP, please ignore this email.
      </p>
    </div>
  `

  console.log(`\n==================================================`)
  console.log(`[OTP SENT] Email: ${email} | Code: ${otp} | Purpose: ${purpose}`)
  console.log(`==================================================\n`)

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Student ERP" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Student ERP OTP Code: ${otp}`,
        html: htmlContent,
      })
      console.log(`Email delivered to ${email}: ${info.messageId}`)
      return { success: true, messageId: info.messageId, delivered: true }
    } catch (err) {
      console.error("Failed to send email via SMTP:", err.message)
      return { success: true, delivered: false, note: `SMTP Error: ${err.message}` }
    }
  }

  return { success: true, delivered: false, note: "Logged to server console (SMTP credentials not configured)" }
}

module.exports = { sendOtpEmail }
