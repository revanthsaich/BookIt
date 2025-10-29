Project split: client and server

This repository contains two independent projects:

- `client/` — the frontend (Vite + React). It has its own `package.json`, `vite.config.ts` and `.gitignore` so you can install and build it separately.
- `server/` — the backend (Express + Mongoose). It has its own `package.json` and `.gitignore` so it can be deployed or run separately.

Quick commands

From repo root:

Frontend (client):

  cd client
  npm ci
  npm run dev       # dev server
  npm run build     # production build -> client/dist/spa

Backend (server):

  cd server
  npm ci
  npm run dev       # starts server using tsx

Notes
- The repository still contains shared files (e.g. `shared/`) used by both projects. The client Vite config references `../shared` so files are accessible during development.
- For deployment: the frontend is configured to publish `client/dist/spa` (see `netlify.toml`). The backend is set up to run as serverless functions (see `api/index.ts` and `server/vercel.ts`) and should be deployed to Vercel with project root = repository root so the `/api` function is discovered.
