# Online Examination System — Full-Stack Web Application

A full-stack, enterprise-grade **Online Examination System** built with **React.js + Vite** on the frontend, **Spring Boot 3 + Spring Security + Spring Data JPA** on the backend, and **MySQL** as the relational database.

---

## 🚀 Key Highlights & Features

### 1. Role-Based Access Control (RBAC)
- **Admin**:
  - Secure JWT authentication.
  - Manage all examinations (create, edit, publish/unpublish, delete).
  - Manage student and teacher accounts (toggle active/inactive status, delete).
  - Comprehensive system metrics (total students, teachers, exams, submissions, average score).
  - Review all candidate submissions, percentages, and pass/fail statuses.
- **Teacher / Examiner**:
  - Secure teacher login.
  - Create and configure examinations with custom duration, passing percentage, total marks, and negative marking.
  - Add multiple-choice (4 options) and True/False questions with individual mark weights and penalty points.
  - Add explanations that remain securely concealed until results are published.
  - Track student submissions, average examination scores, and attempt logs.
- **Student / Candidate**:
  - Register and log in with JWT tokens.
  - Explore published examinations and review pre-exam instructions.
  - Take timed exams in a distraction-free environment.
  - Live server-synchronized countdown timer with auto-submission upon expiry.
  - Periodic auto-save every 10 seconds to safeguard against browser refresh or network loss.
  - Question Palette (Matrix) with color-coded status badges:
    - 🟩 **Answered** (Green)
    - 🟨 **Marked for Review** (Amber)
    - 🟦 **Answered & Marked for Review** (Blue)
    - ⬜ **Unanswered** (Gray)
  - Pre-submission confirmation summary showing answered, review, and skipped questions.
  - Instant automated evaluation upon submission with question-by-question explanations.

### 2. Automated Server-Side Evaluation
- Automatically calculates marks obtained, percentage score, and pass/fail status:
  $$\text{Percentage} = \left(\frac{\text{Marks Obtained}}{\text{Total Marks}}\right) \times 100$$
- Supports configurable negative marking (deductions for wrong answers).
- Correct answers and question explanations are strictly withheld on the backend until submission is finalized.
- Prevents duplicate submissions and enforces hard server-side deadlines.

### 3. Safe Exam Browser & Proctoring Kiosk Mode
- **Mandatory Fullscreen Lock**: Exam initiates in fullscreen kiosk mode; exiting triggers instant proctoring warnings.
- **Tab & Window Focus Monitoring**: Automatically detects tab switches and browser minimization events.
- **Clipboard & Action Blocking**: Blocks `Right-Click` context menu, copy (`Ctrl+C`), paste (`Ctrl+V`), cut (`Ctrl+X`), developer tools (`F12`), and print shortcuts.
- **Real-Time Violation Counter (3-Strike System)**: Every infraction is immediately logged to the backend (`/api/attempts/{attemptId}/violation`). On the 3rd strike, the examination automatically force-submits and terminates the attempt.
- **Audit Trails**: Results report clean proctoring status or the exact number of logged security violations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js 18/19, Vite, JavaScript (JSX), CSS3, Lucide React Icons |
| **Backend** | Java 17 / 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Spring Security 6, Maven |
| **Database** | MySQL 8.0 (`online_exam_db`) |
| **Security** | BCrypt Password Hashing, JWT (JSON Web Tokens), CORS Filter |
| **Tools** | Git, Maven, npm |

---

## 📂 Project Organization

```
online-exam-system/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/onlineexam/
│       │   │   ├── OnlineExamApplication.java
│       │   │   ├── config/             # SecurityConfig, WebMvcConfig, DataInitializer
│       │   │   ├── controller/         # Auth, User, Exam, Question, Attempt, Result, Dashboard
│       │   │   ├── dto/                # Request & Response Data Transfer Objects
│       │   │   ├── entity/             # User, Role, Exam, Question, Option, Attempt, Result
│       │   │   ├── exception/          # GlobalExceptionHandler, Custom Exceptions
│       │   │   ├── repository/         # Spring Data JPA Repositories
│       │   │   ├── security/           # JwtUtils, AuthTokenFilter, UserDetails
│       │   │   └── service/            # Core business logic & EvaluationService
│       │   └── resources/
│       │       └── application.properties
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── style.css                   # Custom responsive design system
│       ├── api/api.js                  # Centralized REST API client
│       ├── context/AuthContext.jsx     # Authentication provider
│       ├── components/                 # Navbar, Sidebar, ManageQuestionsModal
│       └── pages/                      # LandingPage, LoginPage, RegisterPage,
│                                       # AdminDashboard, TeacherDashboard,
│                                       # StudentDashboard, ExamScreen, ResultReviewScreen
├── .gitignore
└── README.md
```

---

## 🔑 Demo Accounts (Seeded Out of the Box)

When the backend starts up, `DataInitializer` seeds test credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@exam.com` | `admin123` | Full access to users, exams, and results |
| **Teacher** | `teacher@exam.com` | `teacher123` | Exam and question authoring, grading |
| **Student** | `student@exam.com` | `student123` | Taking examinations, reviewing scores |

*Note: You can also register new Student and Teacher accounts directly from the UI or Landing Page 1-click buttons.*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student or teacher
- `POST /api/auth/login` — Login with email and password, returns JWT
- `GET /api/auth/me` — Retrieve authenticated user profile

### User Management (`/api/users`)
- `GET /api/users` — List all registered users (Admin only)
- `GET /api/users/{id}` — Get user details by ID (Admin only)
- `PUT /api/users/{id}` — Update user name, role, or active status (Admin only)
- `DELETE /api/users/{id}` — Delete user account (Admin only)
- `GET /api/users/students` — List student accounts (Admin / Teacher)
- `GET /api/users/teachers` — List teacher accounts (Admin)

### Examinations (`/api/exams`)
- `GET /api/exams` — List exams (Role-filtered: published for students, all for admin/teachers)
- `GET /api/exams/published` — List published exams available to students
- `GET /api/exams/my-exams` — List exams authored by logged-in teacher
- `GET /api/exams/{id}` — Get examination by ID
- `POST /api/exams` — Create a new examination (Teacher / Admin)
- `PUT /api/exams/{id}` — Update examination parameters (Teacher / Admin)
- `POST /api/exams/{id}/publish` — Toggle publication status (Teacher / Admin)
- `DELETE /api/exams/{id}` — Delete an examination (Teacher / Admin)

### Questions (`/api/exams/{examId}/questions` & `/api/questions`)
- `GET /api/exams/{examId}/questions` — Get exam questions (Student receives sanitized options without answers; Teachers/Admins receive complete answers & explanations)
- `POST /api/exams/{examId}/questions` — Add MCQ or True/False question (Teacher / Admin)
- `GET /api/questions/{id}` — Get question details (Teacher / Admin)
- `PUT /api/questions/{id}` — Update question and options (Teacher / Admin)
- `DELETE /api/questions/{id}` — Delete question (Teacher / Admin)

### Examination Attempts (`/api/attempts` & `/api/exams/{examId}/start`)
- `POST /api/exams/{examId}/start` — Start or resume examination attempt; delivers server deadline and sanitized questions
- `PUT /api/attempts/{attemptId}/answers` — Periodic autosave of student responses
- `POST /api/attempts/{attemptId}/submit` — Final submission and instant automated evaluation

### Results & Performance (`/api/results` & `/api/dashboard`)
- `GET /api/results/my-results` — Get candidate's completed exam results
- `GET /api/results/{attemptId}` — Get detailed score card with question-by-question review and explanations
- `GET /api/results/exam/{examId}` — Get all candidate results for an exam
- `GET /api/dashboard/admin/stats` — Metrics for admin dashboard
- `GET /api/dashboard/teacher/stats` — Metrics for teacher dashboard
- `GET /api/dashboard/student/stats` — Metrics for student dashboard

---

## 💻 How to Run the Project (Windows Terminal / VS Code)

### Prerequisites
1. **Java JDK 17 or 21** installed and configured on your `PATH`.
2. **Apache Maven** installed (`mvn -v`).
3. **Node.js** (v18+) and **npm** installed (`node -v`, `npm -v`).
4. **MySQL Server 8.0** running on localhost.

---

### Step 1: Database Setup
Ensure MySQL is running with database `online_exam_db`.
If running MySQL on port 3306 or 3307, the backend defaults to:
- Port: `3306` by default (override with `DB_PORT=3307` if your MySQL uses 3307)
- User: `root`
- Password: `root`

To override database credentials without changing code, set environment variables:
```powershell
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASS="your_password"
```

---

### Step 2: Run the Spring Boot Backend
Open a PowerShell terminal in VS Code:
```powershell
cd backend
mvn spring-boot:run
```
The backend will compile, connect to MySQL, auto-generate tables, seed demo data, and listen at **`http://localhost:8080`**.

---

### Step 3: Run the React Frontend
Open a second PowerShell terminal in VS Code:
```powershell
cd frontend
npm install
npm run dev
```
The React development server will start at **`http://localhost:5173`**.

Open your browser and navigate to **`http://localhost:5173`**. For another device on the same Wi-Fi, open the frontend using your computer’s LAN IP (for example `http://192.168.0.11:5173`); the frontend API URL follows that hostname automatically.

---

## 📦 Pushing to GitHub

Follow these steps in your terminal to initialize and push to your GitHub repository:

```powershell
# 1. Initialize git repository in project root
git init

# 2. Add all project files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Complete Online Examination System full-stack application"

# 4. Set main branch
git branch -M main

# 5. Add your remote repository URL (replace with your repo link)
git remote add origin https://github.com/YOUR_USERNAME/online-examination-system.git

# 6. Push to GitHub
git push -u origin main
```
