# DDDP Public Portal

## Secure Public Geography Bridge

The production Node process serves the CRA build and the sanitized `GET /api/public/geography` endpoint:

```powershell
npm.cmd run build
npm.cmd run serve
```

The hosting environment must provide `DDDP_API_BASE_URL`, `DDDP_API_USERNAME`, and `DDDP_API_PASSWORD` as server-side variables. Do not use `REACT_APP_*` variables for these values. See `.env.example` for the complete configuration shape. The repository does not load `.env` files automatically; production secrets should be injected by the deployment platform.
