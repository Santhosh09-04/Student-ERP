import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"

// Public Pages
import LandingPage from "./pages/LandingPage"
import StudentLogin from "./pages/StudentLogin"
import StudentSignup from "./pages/StudentSignup"
import AdminLogin from "./pages/AdminLogin"

// Student Pages
import StudentDashboard from "./pages/StudentDashboard"
import StudentProfile from "./pages/StudentProfile"
import StudentAttendance from "./pages/StudentAttendance"
import StudentMarks from "./pages/StudentMarks"
import StudentPerformance from "./pages/StudentPerformance"
import StudentUpdates from "./pages/StudentUpdates"
import StudentSettings from "./pages/StudentSettings"

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard"
import AdminEnrollment from "./pages/AdminEnrollment"
import AdminStudents from "./pages/AdminStudents"
import AdminAttendance from "./pages/AdminAttendance"
import AdminMarks from "./pages/AdminMarks"
import AdminUpdates from "./pages/AdminUpdates"
import AdminSettings from "./pages/AdminSettings"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentAttendance />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/marks"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentMarks />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/performance"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentPerformance />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/updates"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentUpdates />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout>
                <StudentSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollment"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminEnrollment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminStudents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminAttendance />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/marks"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminMarks />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/updates"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminUpdates />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App