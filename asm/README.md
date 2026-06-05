# 🎓 AdmissionCRM — Admission Management System

Welcome to the **AdmissionCRM** project — a polished full-stack Admission Management & CRM platform built for modern institutions.

> This repository combines fast React/Vite UI, a secure Node.js/Express backend, Prisma for PostgreSQL, and Docker-based deployment for a complete admission workflow.


## 🌈 Why this project shines

- Intuitive admission lifecycle for applicants, seats, and fees
- Multi-role access with Admin, Officer, and Management profiles
- Smart seat matrix control with quota-aware allocation
- Dashboard analytics for enrollment, program distribution, and trends
- Easily deployable using Docker Compose


## 🚀 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + Vite, Zustand, Axios, React Hook Form, Recharts |
| Backend | Node.js, Express, JSON Web Tokens, role-based auth |
| Database | PostgreSQL + Prisma ORM |
| DevOps | Docker, Docker Compose |


## ✨ Key Features

- **Master data management** for institutions, campuses, departments, programs, and academic years
- **Seat Matrix** with quota-based allocation, live counters, and validation
- **Applicant workflow** with search, filter, document checks, and history
- **Admission allocation** for government and management quotas
- **Admission number generation** with secure, immutable IDs
- **Fee tracking** and confirmation workflow for financial control
- **Responsive Dashboard** with cards, charts, and program analytics
- **User roles** and permissions for safe operations


## 🧩 User Roles

| Role | Access Level |
|------|--------------|
| Admin | Full system control: manage users, master data, seats, applicants, and reports |
| Admission Officer | Create/edit applicants, allocate seats, update docs & fees |
| Management | Read-only dashboards and reports for oversight |


## 📁 Project Layout

```text
asm/
├── backend/                 # API, auth, Prisma, migrations
├── frontend/                # React app, pages, components, store
├── docker-compose.yml       # Local Docker orchestration
└── README.md                # Project overview and setup
```


## 🛠️ Local Setup

### Requirements

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Start the backend

```bash
cd asm/backend
npm install
cp .env.example .env
# update backend/.env with your DB and auth values
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### Start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Then open: `http://localhost:5173`


## 🐳 Docker Setup

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:5000`
- Database: `localhost:5432`


## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admission.com | admin123 |
| Officer | officer@admission.com | officer123 |


## 💡 Notes

- The app is built to support admission workflows in colleges and training centers.
- The backend uses Prisma for schema-driven database access.
- The frontend is optimized for speedy, modern CRUD operations.


## ⭐ Ready for GitHub

This README is styled to be polished, easy to scan, and engaging on GitHub. Let me know if you want me to add a project logo, demo screenshots, or a “Getting Started” GIF next.| Management | mgmt@admission.com | mgmt123 |

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
