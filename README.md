# Student ERP System

A full-stack Student ERP (Enrollment & Resource Planning) System website with a clean, modern UI.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT-based authentication with role-based access (Student / Admin)
- **Charts**: Custom Chart component

## User Roles & Auth
- **Admin Login** — separate login page/route (`/admin/login`) with email + password
- **Student Login** — separate login page/route (`/student/login`) with enrollment ID + password
- Passwords hashed with bcrypt, JWT stored securely (httpOnly cookie)
- Protected routes: redirect unauthenticated users to the correct login page
- Role guard: students can't access admin routes and vice versa

## Pages & Routes

### Public Routes
- `/` — Landing page with "Student Login" / "Admin Login" buttons
- `/student/login` — Student login page
- `/admin/login` — Admin login page

### Student Dashboard
- `/student/dashboard` — Student dashboard with attendance, marks, performance, and announcements
- `/student/profile` — Student profile (read-only)
- `/student/attendance` — Student attendance view with monthly percentage
- `/student/marks` — Subject-wise marks and results
- `/student/performance` — Performance trend across terms

### Admin Dashboard
- `/admin/dashboard` — Admin dashboard with summary cards and statistics
- `/admin/enrollment` — Add new students with auto-generated enrollment IDs
- `/admin/students` — Searchable/sortable student management table
- `/admin/attendance` — Mark and view daily attendance
- `/admin/marks` — Add marks per subject/exam/term with auto-calculation
- `/admin/updates` — Post notices, homework, circulars
- `/admin/settings` — Manage admin profile and change password

## Features

### Admin Dashboard
- Summary cards (total students, attendance today, avg. performance, recent updates)
- Student Enrollment form with auto-generate enrollment ID + default password
- Manage Students: searchable/sortable table, edit/delete student records
- Attendance Management: mark daily attendance per class/section
- Marks/Grades Entry: auto-calculate percentage & grade
- Daily Updates/Announcements: post notices visible to students
- Performance Overview: charts showing class-wise performance
- Admin Settings: manage admin profile, change password

### Student Dashboard
- Dashboard home: welcome card, attendance %, latest announcement, marks summary
- My Profile: view personal & enrollment details (read-only)
- Attendance: calendar/table view with monthly percentage
- Marks & Results: subject-wise marks, term-wise comparison
- Overall Performance: line/bar chart of performance trend across terms
- Daily Updates: feed of announcements posted by admin
- Settings: change password

## Layout & Design
- Fully responsive (mobile, tablet, desktop)
- Fixed sidebar + top navbar on desktop; hamburger menu on mobile
- Clean dashboard layout with sidebar navigation
- Modern color palette (indigo/blue primary, soft neutral background)
- Cards with subtle shadows and rounded corners
- Data tables with pagination, search, and sort
- Skeleton loaders and spinners for async data
- Consistent typography (Inter/Poppins font)
- Empty states and error states
- Subtle animations/transitions (hover states, page transitions)
- Dark mode toggle (optional)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or provide connection string)

### Client Setup
```bash
cd client
npm install
npm run dev
```
The client runs on `http://localhost:5173` (Vite default)

### Server Setup
```bash
cd server
npm install
npm start
```
The server runs on `http://localhost:5000` (or PORT from .env)

### Environment Variables
Create `.env` file in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_erp
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
BCROUNDS=10
```

### Database Seeding
```bash
cd server
node seed.js
```
This seeds the database with 5 sample students.

## API Endpoints

### Authentication
- `POST /api/auth/student-login` — Student login
- `POST /api/auth/admin-login` — Admin login
- `POST /api/auth/logout` — User logout

### Student Routes ( Protected - Student role only)
- `GET /api/students/profile` — Get student profile
- `GET /api/students/attendance` — Get student attendance
- `GET /api/students/marks` — Get student marks
- `GET /api/students/performance` — Get student performance

### Admin Routes ( Protected - Admin role only)
- `GET /api/admin/dashboard/stats` — Get dashboard statistics
- `GET /api/admin/students` — Get all students
- `POST /api/admin/students` — Add new student
- `PUT /api/admin/students/:id` — Update student
- `DELETE /api/admin/students/:id` — Delete student
- `GET /api/admin/attendance` — Get attendance records
- `POST /api/admin/attendance/mark` — Mark attendance
- `GET /api/admin/marks` — Get marks records
- `POST /api/admin/marks` — Add marks
- `GET /api/admin/announcements` — Get announcements
- `POST /api/admin/announcements` — Post announcement

## Deliverables
- Complete folder structure (client/server)
- `.env.example` file with required environment variables
- README with setup and run instructions
- Seed script with sample dummy data (5 students)
- Modular and reusable components (Sidebar, Navbar, StatCard, Chart)