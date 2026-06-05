# AdmissionCRM — Admission Management System

A production-quality full-stack Admission Management & CRM web application built with React, Node.js, Express, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS, React Router, Axios, React Hook Form, Recharts, Zustand |
| Backend | Node.js, Express.js, JWT Auth, Role-based Authorization |
| Database | PostgreSQL + Prisma ORM |
| DevOps | Docker, Docker Compose |

---

## Features

- **Master Setup** — Institutions, Campuses, Departments, Programs, Academic Years
- **Seat Matrix** — Quota-wise seat configuration with real-time counters
- **Applicant Management** — Full CRUD with search, filters, document status tracking
- **Admission Allocation** — Government & Management flow with seat locking
- **Admission Confirmation** — Immutable admission number generation
- **Fee Management** — Fee status tracking with confirmation gate
- **Dashboard** — Stats cards, trend charts, quota distribution, program analytics
- **User Management** — Role-based access (Admin / Admission Officer / Management)

---

## User Roles

| Role | Permissions |
|------|------------|
| Admin | Full access — CRUD all modules, manage users, delete records |
| Admission Officer | Create/edit applicants, allocate seats, update fee/doc status |
| Management | Read-only access to all modules and dashboard |

---

## Project Structure

```
asm/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── users.controller.js
│   │   │   ├── master.controller.js
│   │   │   ├── seatMatrix.controller.js
│   │   │   ├── applicants.controller.js
│   │   │   ├── admissions.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT + role middleware
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   ├── master.routes.js
│   │   │   ├── seatMatrix.routes.js
│   │   │   ├── applicants.routes.js
│   │   │   ├── admissions.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── utils/
│   │   │   ├── pagination.js
│   │   │   ├── admissionNumber.js
│   │   │   └── seed.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios instance with interceptors
│   │   │   └── index.js           # All API service modules
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── CrudPage.jsx
│   │   │   │   └── index.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   └── useApi.js
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.jsx
│   │   │   ├── dashboard/DashboardPage.jsx
│   │   │   ├── master/
│   │   │   │   ├── InstitutionsPage.jsx
│   │   │   │   ├── CampusesPage.jsx
│   │   │   │   ├── DepartmentsPage.jsx
│   │   │   │   ├── ProgramsPage.jsx
│   │   │   │   ├── AcademicYearsPage.jsx
│   │   │   │   └── SeatMatrixPage.jsx
│   │   │   ├── applicants/
│   │   │   │   ├── ApplicantsPage.jsx
│   │   │   │   ├── ApplicantForm.jsx
│   │   │   │   └── ApplicantDetailPage.jsx
│   │   │   ├── admissions/
│   │   │   │   ├── AdmissionsPage.jsx
│   │   │   │   └── AllocateForm.jsx
│   │   │   └── users/UsersPage.jsx
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Setup

```bash
git clone <repo-url>
cd asm
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/admission_db?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Docker Deployment

```bash
# From project root
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- Database: `localhost:5432`

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admission.com | admin123 |
| Admission Officer | officer@admission.com | officer123 |
| Management | mgmt@admission.com | mgmt123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/change-password | Change password |

### Master Setup
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/institutions | List / Create |
| GET/PUT/DELETE | /api/institutions/:id | Read / Update / Delete |
| GET/POST | /api/campuses | List / Create |
| GET/POST | /api/departments | List / Create |
| GET/POST | /api/programs | List / Create |
| GET/POST | /api/academic-years | List / Create |
| PATCH | /api/academic-years/:id/set-current | Set current year |

### Seat Matrix
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/seat-matrix | All programs matrix |
| GET | /api/seat-matrix/:programId | Program matrix |
| POST | /api/seat-matrix/:programId | Upsert matrix |

### Applicants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applicants | List with filters |
| POST | /api/applicants | Create |
| GET | /api/applicants/:id | Detail |
| PUT | /api/applicants/:id | Update |
| PATCH | /api/applicants/:id/document-status | Update doc status |
| DELETE | /api/applicants/:id | Delete (Admin) |

### Admissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admissions | List with filters |
| POST | /api/admissions/allocate | Allocate seat |
| PATCH | /api/admissions/:id/confirm | Confirm (generates number) |
| PATCH | /api/admissions/:id/fee-status | Update fee status |
| PATCH | /api/admissions/:id/cancel | Cancel (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Aggregated stats + charts |

---

## Business Rules Enforced

1. Quota seats total cannot exceed program intake
2. No seat allocation when quota is full
3. Admission number generated only once (immutable)
4. Admission confirmation requires fee paid
5. Cancelled admissions release the seat back to quota
6. Management role has read-only access

---

## Admission Number Format

```
INST/YEAR/COURSETYPE/PROGCODE/QUOTA/SEQUENCE
Example: RVCE/2025/UG/BECS/KCET/0001
```

---

## Database Schema

Key models: `User`, `Institution`, `Campus`, `Department`, `Program`, `AcademicYear`, `SeatMatrix`, `Applicant`, `Admission`

Run `npm run db:studio` in the backend directory to open Prisma Studio for visual DB management.
