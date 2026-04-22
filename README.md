# 🎨 Employee Management System — Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> A responsive and modern React.js frontend for the Employee Management System with Role-Based Access Control (RBAC). Different dashboards for Admin, HR, and Employee roles.

---

## 🌐 Live Website

```
https://ems-frontend-b5hv.vercel.app
```

---

## 🔐 Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👑 Admin | admin@ems.com | password123 | Full access — manage employees, view reports, charts |
| 👩💼 HR Manager | hr@ems.com | password123 | View employees, approve leaves, add performance reviews |
| 👨💻 Employee | employee@ems.com | password123 | Own profile, apply leave, attendance, salary slip |

---

## 🚀 Features

### 👑 Admin Dashboard
- ✅ View all employees with Search & Filter by name/department
- ✅ Add new employees with full details
- ✅ Edit employee information
- ✅ Delete employees
- ✅ Pagination (5 employees per page)
- ✅ Interactive Charts — Employees by Department, Leave Status, Average Salary
- ✅ Stats cards — Total Employees, Active Employees, Departments, Pending Leaves

### 👩💼 HR Dashboard
- ✅ View all employees
- ✅ Approve or Reject leave requests with pending badge count
- ✅ View today's attendance records
- ✅ Add performance reviews with star ratings (1–5)
- ✅ View all performance reviews

### 👨💻 Employee Portal
- ✅ View own profile details
- ✅ Attendance — Check-in and Check-out with history
- ✅ Apply for leave (Sick / Casual / Annual)
- ✅ View leave history with status (Pending / Approved / Rejected)
- ✅ View salary slip with breakdown (Basic Pay, HRA, Allowances)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React.js | Frontend Framework |
| React Router DOM | Client-side Routing |
| Axios | HTTP Requests to Backend API |
| Recharts | Interactive Charts & Graphs |
| localStorage | JWT Token Storage |
| CSS-in-JS (inline styles) | Component Styling |

---

## 📁 Project Structure

```
ems-frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.js            # Login page (all roles)
│   │   ├── AdminDashboard.js   # Admin dashboard
│   │   ├── HRDashboard.js      # HR dashboard
│   │   └── EmployeePortal.js   # Employee portal
│   ├── App.js                  # Routes & role-based navigation
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── .gitignore
├── package.json
└── vercel.json                 # Vercel SPA routing config
```

---

## 🔄 How Role-Based Navigation Works

```
Login Page
    ↓
User enters credentials → API call to backend
    ↓
JWT Token + Role received → stored in localStorage
    ↓
Role = "admin"    → Redirect to /admin    (Admin Dashboard)
Role = "hr"       → Redirect to /hr       (HR Dashboard)
Role = "employee" → Redirect to /employee (Employee Portal)
    ↓
Protected Routes → If wrong role tries to access → redirect to Login
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v14+
- Backend API running (see backend repo)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/yogesh-pothugunta/ems-frontend.git
cd ems-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Update API URL** (if running backend locally)

In all page files, update:
```js
// Change this
'https://ems-backend-en67.onrender.com'

// To this (for local development)
'http://localhost:5000'
```

**4. Start the development server**
```bash
npm start
```

**5. Open in browser**
```
http://localhost:3000
```

---

## 📸 Pages Overview

| Page | Route | Access |
|------|-------|--------|
| Login | `/` | Public |
| Admin Dashboard | `/admin` | Admin only |
| HR Dashboard | `/hr` | HR only |
| Employee Portal | `/employee` | Employee only |

---

## 🌍 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://ems-frontend-b5hv.vercel.app |
| Backend API | Render | https://ems-backend-en67.onrender.com |
| Database | Railway | MongoDB Cloud |

---

## 🔗 Related Repository

- ⚙️ Backend API: [ems-backend](https://github.com/yogesh-pothugunta/ems-backend)
- 📡 API Base URL: [https://ems-backend-en67.onrender.com](https://ems-backend-en67.onrender.com)

---

## 👨💻 Developer

**Yogesh Pothugunta**
- 📧 yogeshpothugunta07@gmail.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/yogesh-pothugunta-9a9a13403)
- 🐙 [GitHub](https://github.com/yogesh-pothugunta)

---
