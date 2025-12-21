# TY Project Launchpad (TYForge)

## Project Overview
**TY Project Launchpad** is a comprehensive platform designed for Final Year Engineering students to manage their projects. It includes features for project creation, synopsis management, order tracking for project plans, consultation meeting scheduling, and an admin dashboard for oversight.

The system is a full-stack application composed of:
*   **Backend:** A Python FastAPI server providing RESTful APIs, utilizing PostgreSQL (Neon) for data persistence.
*   **Frontend:** A modern React application built with Vite, styled with Tailwind CSS and shadcn-ui, offering a responsive user interface.

## Tech Stack

### Backend (`backend_new/`)
*   **Framework:** FastAPI
*   **Language:** Python 3.9+
*   **Database:** PostgreSQL (using Neon.tech for production)
*   **ORM:** SQLAlchemy 2.0+
*   **Migrations:** Alembic
*   **Authentication:** JWT (JSON Web Tokens) with `python-jose` and `passlib`
*   **Validation:** Pydantic

### Frontend (`ty-project-launchpad-new-version/`)
*   **Framework:** React (via Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn-ui
*   **State/Data Fetching:** React Query (`@tanstack/react-query`)
*   **Routing:** React Router DOM
*   **Icons:** Lucide React, React Icons

## Building and Running

### Prerequisites
*   Node.js (v18+) & npm
*   Python (v3.9+) & pip
*   PostgreSQL (local or cloud connection string)

### Convenience Scripts (Root Directory)
The project root contains batch scripts for Windows to simplify operations:
*   `start_all.bat`: Starts both backend and frontend servers.
*   `start_backend.bat`: Starts only the backend server.
*   `start_frontend.bat`: Starts only the frontend development server.
*   `stop_all.bat`: Stops running servers.

### Manual Setup & Execution

#### Backend
1.  **Navigate:** `cd backend_new`
2.  **Install Dependencies:** `pip install -r requirements.txt`
3.  **Environment:** Create `.env` from `.env.example`. Ensure `DATABASE_URL` is set.
4.  **Run Server:** `python run.py` (Starts on `http://localhost:8000`)
    *   *Alternative:* `uvicorn app.main:app --reload`
5.  **Docs:** Swagger UI available at `http://localhost:8000/docs`.

#### Frontend
1.  **Navigate:** `cd ty-project-launchpad-new-version`
2.  **Install Dependencies:** `npm install`
3.  **Environment:** Create `.env` if needed (check `.env.example`), typically setting `VITE_API_BASE_URL`.
4.  **Run Dev Server:** `npm run dev` (Starts on `http://localhost:5173` or similar)
5.  **Build:** `npm run build`

## Development Conventions

*   **Database Migrations:**
    *   Changes to models in `backend_new/app/models/` require a new Alembic migration.
    *   Generate migration: `alembic revision --autogenerate -m "description"`
    *   Apply migration: `alembic upgrade head`
*   **Environment Variables:**
    *   Never commit `.env` files. Use `.env.example` to track required variables.
    *   The Backend `SECRET_KEY` is critical for security.
*   **Frontend API Calls:**
    *   Frontend uses a configured Axios instance (likely in `src/config/api.ts` or similar) to communicate with the backend. Ensure `VITE_API_BASE_URL` matches the running backend URL.
*   **Admin Access:**
    *   Admin users can be created via the `create_admin.py` script in the backend directory or by manually updating the `is_admin` flag in the `users` table.

## Key Files & Directories

*   `backend_new/app/main.py`: Entry point for the FastAPI application.
*   `backend_new/app/models/`: Database models defining the schema.
*   `backend_new/app/routers/`: API route handlers organized by feature.
*   `ty-project-launchpad-new-version/src/App.tsx`: Main frontend component and routing setup.
*   `ty-project-launchpad-new-version/src/pages/`: Individual page components (Admin Dashboard, Login, etc.).
*   `DEPLOYMENT_GUIDE_VERCEL_NEON.md`: Detailed guide for production deployment.
