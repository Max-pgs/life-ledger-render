# Life Ledger Frontend

This directory contains the React frontend for Life Ledger, a responsive UK-focused life-admin and commitments management application.

For the overall project description, backend information, deployment details and testing summary, see the main [README.md](../README.md).

## Technology

- React
- Vite
- React Router
- JavaScript
- Custom CSS
- Vitest
- React Testing Library
- jsdom

## Structure

The main frontend source code is organised as follows:

- `src/components/` - reusable interface components
- `src/layouts/` - shared application layouts
- `src/pages/` - application pages and main user flows
- `src/routes/` - route-level access control
- `src/services/` - communication with the Django REST API
- `src/test/` - frontend automated tests and test configuration
- `src/assets/` - application icons and other frontend assets

## Local Setup

Install the frontend dependencies:

```bash
npm install
```

For local development, the frontend uses the following Django API address by default:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

A local `.env` file is therefore not required for the standard development setup.

If a different API address is required, create a `.env` file based on `.env.example` and set `VITE_API_BASE_URL` to the required URL.

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```
http://localhost:5173
```

The Django backend should be running separately for API-dependent functionality.

## Testing

Run the frontend tests in watch mode:

```bash
npm test
```

Run the complete frontend test suite once:

```bash
npm run test:run
```

The final focused frontend suite contains **8 automated tests** covering:

- protected-route behaviour
- commitment search
- current-month payment filtering
- cancellation deadline calculation
- recurring-payment form guidance
- dashboard payment-status navigation

## Linting

Run ESLint with:

```bash
npm run lint
```

## Production Build

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

The generated production files are written to the `dist/` directory.

## AI Usage

Artificial intelligence tools were used during parts of the frontend development process.

Project-level AI usage and source-code classification are documented in [AI_DECLARATION.md](../AI_DECLARATION.md).
