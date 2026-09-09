# Life Ledger

Life Ledger is a responsive UK-focused web application for organising recurring and one-off life-admin commitments.

**Live application:** https://lifeledger-frontend.onrender.com/

**Source code:** https://github.com/Max-pgs/life-ledger-render

## Main Features

- User registration, login, logout and account management
- Create, view and edit commitments
- Archive, restore and permanently delete commitments
- UK-specific commitment groups and guidance
- Reusable UK commitment templates
- Guided Setup for identifying relevant commitments
- “What have I forgotten?” checklist
- Dashboard views for upcoming, overdue, high-priority and review-needed commitments
- Cancellation deadline calculation
- Recurring and one-off payment-cycle tracking
- Payment history
- Current-month Paid, Pending and Overdue payment overview
- Commitment achievements
- Responsive desktop and mobile interface
- Mock Premium functionality for demonstration purposes

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Django Token Authentication
- Docker / Docker Compose
- Gunicorn

### Frontend

- React
- Vite
- React Router
- JavaScript
- Custom CSS

## Project Structure

The project is divided into separate backend and frontend parts.

The backend provides the REST API, authentication, data persistence and application business logic.

The frontend provides the responsive React user interface and communicates with the backend API.

PostgreSQL is used as the main application database.

## Local Setup

### Prerequisites

To run the application locally, install:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) - includes npm
- [Git](https://git-scm.com/downloads), if cloning the repository

Python and PostgreSQL do not need to be installed separately because the backend and database run in Docker.

### 1. Clone or download the repository

Clone the repository using Git, or download and extract the project ZIP file.

```bash
git clone https://github.com/Max-pgs/life-ledger-render.git
cd life-ledger-render-main
```

Alternatively, download the project as a ZIP file from GitHub and extract it locally.

### 2. Configure the local environment

Create a local `.env` file from the provided example.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On Window CMD:
```bash
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

### 3. Start the backend and database

Make sure Docker Desktop is running, then run the following command from the project root:

```bash
docker compose up --build
```

Database migrations are applied automatically when the backend container starts.

The backend API runs on port 8000 and is used by the React frontend. It does not provide a user-facing page.

Continue with the frontend setup below and open the frontend application in the browser.

### 4. Start the frontend

Open a second terminal and run:

```bash
cd life-ledger-render-main
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```
http://localhost:5173
```

Open this address in a browser to use Life Ledger locally.

For subsequent runs, `npm install` does not normally need to be repeated unless the frontend dependencies have changed.

### Optional: Django Admin

The Django admin interface is available locally at:

```
http://localhost:8000/admin/
```

If no local administrator account exists, create one from the project root:

```bash
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to create the administrator account, then use the created credentials to sign in to the Django admin interface.

The admin interface can be used to manage application data such as commitment groups, templates and guidance content.

## Testing

The final application is supported by automated, manual and browser-based testing.

The backend regression suite contains **124 automated tests** covering the main models, API endpoints, permissions, validation rules and business logic.

The frontend contains **8 focused automated tests** implemented using Vitest and React Testing Library. These cover critical user flows including protected routing, commitment search, current-month payment filtering, commitment-form behaviour and dashboard navigation.

Additional validation included manual API testing, browser testing, responsive testing and integration checks.

Backend automated tests can be run with:

```bash
docker compose exec backend python manage.py test
```

Frontend validation can be run from the frontend directory with:

```bash
npm run test:run
npm run lint
npm run build
```

## Deployment

The application is deployed using Render.

GitLab is the source-of-truth repository for project development and version control. GitHub is used only as a mirror for Render deployment.

## AI Usage

Artificial intelligence tools were used during parts of the software development process.

Details of AI assistance, source-code classification and verification are documented in [AI_DECLARATION.md](AI_DECLARATION.md).

Relevant AI-assisted sections are also identified in the source code where appropriate.
