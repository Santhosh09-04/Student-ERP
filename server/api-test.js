// API smoke test for Student ERP authentication & protected routes
const BASE = "http://localhost:5000"

async function call(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, data }
}

let passCount = 0
let failCount = 0
function check(name, condition, extra = "") {
  if (condition) { passCount++; console.log(`✅ PASS: ${name} ${extra}`) }
  else { failCount++; console.log(`❌ FAIL: ${name} ${extra}`) }
}

async function main() {
  console.log("=== Student ERP API Tests ===\n")

  // 1. Base route
  let r = await call("/")
  check("GET / returns 200", r.status === 200, `(${r.status})`)

  // 2. Admin login with correct credentials
  r = await call("/api/auth/admin-login", { method: "POST", body: { email: "admin@student.edu", password: "Admin@123" } })
  check("Admin login success", r.status === 200 && r.data.token, `role=${r.data.user?.role}`)
  const adminToken = r.data.token || ""

  // 3. Admin login with wrong password
  r = await call("/api/auth/admin-login", { method: "POST", body: { email: "admin@student.edu", password: "wrong" } })
  check("Admin login rejected on bad password", r.status === 401, `(${r.status})`)

  // 4. Student login with correct credentials
  r = await call("/api/auth/student-login", { method: "POST", body: { enrollmentId: "STD-2024-001", password: "Student@123" } })
  check("Student login success", r.status === 200 && r.data.token, `name=${r.data.user?.name}`)
  const studentToken = r.data.token || ""

  // 5. Student login with wrong enrollment ID
  r = await call("/api/auth/student-login", { method: "POST", body: { enrollmentId: "STD-9999", password: "Student@123" } })
  check("Student login rejected on bad ID", r.status === 401, `(${r.status})`)

  // 6. /me with admin token
  r = await call("/api/auth/me", { token: adminToken })
  check("GET /api/auth/me (admin)", r.status === 200 && r.data.user?.role === "admin", `role=${r.data.user?.role}`)

  // 7. /me with student token
  r = await call("/api/auth/me", { token: studentToken })
  check("GET /api/auth/me (student)", r.status === 200 && r.data.user?.role === "student", `enrollmentId=${r.data.user?.enrollmentId}`)

  // 8. Protected route without token → 401
  r = await call("/api/auth/me")
  check("Protected route without token → 401", r.status === 401, `(${r.status})`)

  // 9. Protected route with invalid token → 403
  r = await call("/api/auth/me", { token: "not-a-valid-token" })
  check("Protected route with invalid token → 403", r.status === 403, `(${r.status})`)

  // 10. Student accessing admin route → 403 (role guard)
  r = await call("/api/admin/dashboard/stats", { token: studentToken })
  check("Student blocked from admin route → 403", r.status === 403, `(${r.status})`)

  // 11. Admin dashboard stats
  r = await call("/api/admin/dashboard/stats", { token: adminToken })
  check("Admin dashboard stats", r.status === 200 && typeof r.data.totalStudents === "number", `totalStudents=${r.data.totalStudents}, attendanceToday=${r.data.attendanceToday}`)

  // 12. Admin list students (paginated)
  r = await call("/api/admin/students?search=STD&page=1&limit=3", { token: adminToken })
  check("Admin list students (paginated)", r.status === 200 && Array.isArray(r.data.students), `total=${r.data.total}, returned=${r.data.students?.length}`)

  // 13. Student attendance
  r = await call("/api/attendance", { token: studentToken })
  check("Student attendance", r.status === 200 && typeof r.data.percentage === "number", `percentage=${r.data.percentage}, days=${r.data.totalDays}`)

  // 14. Student marks
  r = await call("/api/marks", { token: studentToken })
  check("Student marks", r.status === 200 && Array.isArray(r.data.marks), `marks=${r.data.marks?.length}, termSummary=${r.data.termSummary?.length}`)

  // 15. Announcements (public to authenticated)
  r = await call("/api/announcements", { token: studentToken })
  check("Announcements for students", r.status === 200 && Array.isArray(r.data), `count=${r.data?.length}`)

  // 16. Admin post announcement
  r = await call("/api/admin/announcements", { method: "POST", token: adminToken, body: { title: "Test Notice", description: "API test", category: "Notice" } })
  check("Admin post announcement", r.status === 201 && r.data._id, `id=${r.data?._id?.slice(0, 8)}`)

  // 17. Forgot password (mocked, always 200)
  r = await call("/api/auth/forgot-password", { method: "POST", body: { email: "admin@student.edu" } })
  check("Forgot password returns 200", r.status === 200)

  // 18. Unknown route → 404
  r = await call("/api/nonexistent")
  check("Unknown route → 404", r.status === 404, `(${r.status})`)

  // 19. Logout
  r = await call("/api/auth/logout", { method: "POST", token: adminToken })
  check("Logout", r.status === 200)

  console.log(`\n=== Results: ${passCount} passed, ${failCount} failed ===`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Test runner error:", err)
  process.exit(1)
})