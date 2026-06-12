# Frontend Deployment — Vercel

The frontend (`web/`) is a Vite + React SPA deployed on Vercel. All routing is client-side; `web/vercel.json` rewrites every path to `index.html` so refreshes and deep links work.

## Vercel project settings

| Setting | Value |
|---|---|
| **Root Directory** | `web` |
| **Framework Preset** | Vite (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for the Production environment.

| Variable | Description | Required |
|---|---|---|
| `VITE_USE_DUMMY_DATA` | `false` to connect to real API | Yes |
| `VITE_API_BASE_URL` | Full URL to API, e.g. `https://api.freelanceos.app/api/v1` | Yes |
| `VITE_SOCKET_URL` | socket.io server root, e.g. `https://api.freelanceos.app` | Yes |

> For preview/staging deployments, set separate values scoped to the **Preview** environment in Vercel.

## How it works

`web/vercel.json` handles two things:

1. **SPA rewrites** — any path that doesn't match a static file is served `index.html`, letting React Router take over.
2. **Asset caching** — Vite content-hashes every file in `/assets/`, so they're served `Cache-Control: immutable`.

## Deploy steps

```bash
# 1. Push to main — Vercel auto-deploys via Git integration

# 2. Manual / local preview
cd web
npm run build       # outputs to web/dist/
npm run preview     # serves dist/ locally on :4173
```

## CORS

The API (`api/`) must allow the Vercel deployment URL. Set `CLIENT_ORIGIN` in the API's environment:

```
CLIENT_ORIGIN=https://freelanceos.app
```

During development Vercel generates preview URLs (`*.vercel.app`). Either add them individually or use a wildcard in the API's CORS config for non-production environments.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Refresh on any route → 404 | Missing `vercel.json` rewrites | Ensure `web/vercel.json` is committed |
| Blank page / network errors | Wrong `VITE_API_BASE_URL` | Check env var in Vercel dashboard |
| Auth drops on refresh | `freelanceos-auth` key missing in localStorage | Zustand `persist` requires localStorage; confirm browser allows it |
| socket.io not connecting | `VITE_SOCKET_URL` wrong or API CORS blocks socket upgrade | Match origin with API's `CLIENT_ORIGIN` |
