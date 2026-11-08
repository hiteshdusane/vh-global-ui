# Railway deployment

The repository explicitly uses a Dockerfile builder via `railway.json`. This bypasses Railpack's mise installation, which was repeatedly failing with HTTP 504 while downloading a GitHub release before the application build started.

The build uses Node 22, installs dependencies from `package-lock.json` with `npm ci`, and runs `npm run build`. The final image uses Caddy to serve only `dist`. Caddy listens on Railway's `PORT` (8080 by default), serves `/health`, and falls back to `index.html` for React routes. Missing `/assets/*` files return 404.

## Railway settings

- Service source: this repository, branch `master`, repository root `/`.
- Config file: `/railway.json`. If the service already specifies a different config file path, change it to this file.
- Builder: Dockerfile. The repository config selects it automatically.
- Start command: supplied by `railway.json`; the previous Node/Vite command must not override it.
- Keep existing `VITE_API_URL`, `VITE_GA_MEASUREMENT_ID`, `VITE_GA_DEBUG`, and `VITE_APP_SCRIPT_EXCEL_URL` service variables if configured. These are declared as Docker build arguments and embedded in the Vite build. When no override is provided, the committed `.env.production` supplies defaults. Rebuild after changing a `VITE_` variable.
- Verify that the custom domain target port matches the service's `PORT`. Keep the custom domains attached to the same service.

The Docker context excludes `.env.local`, credentials directories, local dependencies, and generated build output. The production environment file contains public browser configuration only.

## Verify the deployment

1. New build logs should show Dockerfile steps such as `FROM node:22-alpine`, rather than the failing Railpack/mise download.
2. The container health check at `/health` should return 200.
3. Visit `/`, refresh `/contact`, and refresh a valid `/products/<id>` URL.
4. Verify product loading, GA4 Realtime, and a Google Sheets enquiry.

For local container verification with Docker running:

```powershell
docker build -t vhn-global-ui .
docker run --rm -p 8080:8080 -e PORT=8080 vhn-global-ui
```

Check http://localhost:8080/health and http://localhost:8080/contact. Docker image pulls and npm package downloads still require their respective registries to be reachable; this change specifically removes the failing Railpack/mise download path.

References: https://docs.railway.com/builds/dockerfiles and https://railway.com/guides/react
