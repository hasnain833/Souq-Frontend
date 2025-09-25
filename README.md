# SOUQ Frontend (Vite + React)

## Key Changes
- Admin panel lives under the same SPA at `/admin`.
- No hardcoded test credentials in code. Admin must exist in DB (or be seeded).
- No custom dev ports. Vite picks a free port automatically.
- Optional dev proxy to backend if `VITE_API_BASE_URL` is set.

## Environment
Create `.env` from `.env.example`:

```
VITE_API_BASE_URL=              # optional: e.g., http://localhost:5000
VITE_SOCKET_URL=                # optional; falls back to VITE_API_BASE_URL or same-origin
```

If omitted, the frontend will call the backend on the same origin. In dev you can:
- Run backend on `http://localhost:5000`
- Set `VITE_API_BASE_URL=http://localhost:5000` to enable the Vite proxy

## Development
```
npm install
npm run dev
```
Vite will choose a free port (e.g., 5173). Visit:
- User app: http://localhost:<vite-port>/
- Admin app: http://localhost:<vite-port>/admin

## Notes
- Make sure backend CORS `FRONTEND_ORIGIN` is set in production to the frontend URL.
- Socket usage falls back to same-origin if no vars set.
