> Production-readiness fork of https://github.com/sellwane7/deskflow (GitHub doesn't allow forking my own repo, so this is a full copy with history).

# DeskFlow — Internal IT Service Request Portal

A full-stack ticketing system for employees to report IT issues and admins to
manage resolutions. Built with React, Node.js/Express, and MongoDB (Mongoose).

## Stack

- **Frontend:** React (functional components + Hooks + Context API)
- **Backend:** Node.js + Express
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (role: `Employee` | `Admin`)
- **Docs:** OpenAPI/Swagger UI (`/api-docs`) + Postman collection (`postman_collection.json`)

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection (local or MongoDB Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET
npm run seed                # creates demo Employee + Admin users
npm run dev                 # starts on http://localhost:5000
```
Swagger UI: **https://deskflow-api-rocc.onrender.com/api-docs**

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start                   # starts on http://localhost:3000
```

### Demo credentials

| Role     | Email                  | Password    |
|----------|--------------------------|-------------|
| Employee | employee@deskflow.com  | password123 |
| Admin    | admin@deskflow.com     | password123 |

## API summary

| Method | Route              | Access         | Description                              |
|--------|----------------------|----------------|--------------------------------------------|
| POST   | /api/auth/login     | Public         | Returns JWT + user role                   |
| POST   | /api/tickets        | Employee       | Create a ticket                           |
| GET    | /api/tickets        | Employee/Admin | Employees see own tickets, Admins see all |
| PUT    | /api/tickets/:id    | Admin          | Update ticket status                      |

## Testing the API

- **Swagger UI** at `/api-docs` — interactive, in-browser testing
- **Postman collection** (`postman_collection.json`) — import into Postman; includes
  a `baseUrl` variable and test scripts that auto-capture Employee/Admin JWTs and
  the last created ticket ID.

## Project Demo

**Live Demo:** https://deskflow-ebon.vercel.app/

## Author

**Joyce Sellwane Mosia**

## Production readiness

This fork extends DeskFlow with tests, containers, CI/CD and Kubernetes deployment. Note that DeskFlow uses MongoDB, so the stack runs `mongo:7` in place of Postgres.

| Area | Where |
|---|---|
| Test plan | [docs/TEST_PLAN.md](docs/TEST_PLAN.md) |
| Setup guide (tests, Docker Compose, Kubernetes) | [docs/SETUP.md](docs/SETUP.md) |
| Architecture and CI/CD diagrams | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| CI pipeline | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| CD pipeline (images to GHCR) | [.github/workflows/cd.yml](.github/workflows/cd.yml) |
| Kubernetes manifests | [k8s/](k8s/) |

Health checks: liveness `GET /api/health`, readiness `GET /api/ready` (503 until MongoDB is connected).

Demo video: <paste the link here>
