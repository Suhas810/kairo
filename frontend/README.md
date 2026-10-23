# Kairo frontend

Kairo is a frontend-only developer workspace demo built with React, TypeScript, Vite, Tailwind CSS, React Router, and Lucide icons.

## Run locally

From the repository root in PowerShell:

```powershell
Set-Location frontend
npm.cmd install
npm.cmd run dev
```

Vite prints the local URL after startup. Run `npm.cmd test` for focused routing and theme regression tests, `npm.cmd run lint` for linting, and `npm.cmd run build` for the production build.

## Demo limitations

- Development sign-in is a client-side mock enabled only by Vite's development mode. It accepts a valid email and a password of at least eight characters; the password is not sent to a server or stored. The mock session marker is stored in local storage until sign-out. Production builds disable sign-in.
- Initial project, repository, and Git data are local demo fixtures. Projects created in the UI exist only in memory and are lost on reload.
- The agent does not call a model or change files. Execution controls show deterministic simulated outcomes and do not run system commands or claim results from a real test run.
- The terminal only supports `help`, `pwd`, `ls`, and `clear`. It is not an operating-system shell.
- There is no backend application in this repository (`backend/` is empty), no Git provider, and no WebSocket endpoint. Agent submissions, repository connections, and execution history require backend integrations.
- Profile editing and workspace/notification preferences are stored locally for this development demo. Preferences do not deliver notifications, and local profile edits are not synced to a user service.
- Appearance supports dark, light, and system themes. The selection is stored in browser local storage.

## Configuration and integration status

- `VITE_API_BASE_URL` sets the base URL used by the shared API request helper; it defaults to `http://localhost:4000/api`. No current page is wired to a backend endpoint.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are detected by the auth service only. Supabase Auth is not implemented, and setting these values does not enable production authentication.
- Do not put service-role keys, passwords, or other private credentials in frontend environment variables. Implement privileged operations on the backend.

Example local `.env.local` for a future API integration:

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api
```
