# Installation & Local Setup Guide — ZEROTrace AI

This guide walks you through setting up and running **ZEROTrace AI** on your local machine.

---

## 1. System Prerequisites

Ensure you have the following installed on your operating system (Windows, macOS, or Linux):

- **Node.js:** `v18.0.0` or higher (verified on Node `v24.19.0`).
- **Package Manager:** `npm` `v9.0.0`+ (verified on npm `11.17.0`) or `pnpm` `v9.0.0`+.
- **Git:** `v2.40.0` or higher.
- **Modern Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Brave.

---

## 2. Quick Start

### Step 1: Clone or Navigate to the Repository
```powershell
# If cloning from GitHub:
git clone https://github.com/rajivsharma8757/ZEROTrace-AI.git
cd ZEROTrace-AI

# Or navigate to your existing local folder:
cd C:\Users\Lenovo\dyad-apps\zero-trace-ai
```

### Step 2: Install Dependencies
```powershell
npm install
```
*(If you have `pnpm` installed: `pnpm install`)*

### Step 3: Start the Development Server
```powershell
npm run dev
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:8080
```

---

## 3. Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) on port `8080`. |
| `npm run build` | Compiles TypeScript and creates optimized production bundles in `dist/`. |
| `npm run build:dev` | Builds the application in development mode for debugging bundle issues. |
| `npm run preview` | Spins up a local static server to test the generated `dist/` production build. |
| `npm run lint` | Runs ESLint across all TypeScript and React files in `src/`. |
| `npx tsc --noEmit` | Runs the TypeScript compiler in verification mode with zero file output. |

---

## 4. Port Configuration

By default, Vite is configured in `vite.config.ts` to listen on port `8080`:
```ts
server: {
  host: "::",
  port: 8080,
}
```

If port `8080` is already occupied by another service on your machine, you can:
1. Temporarily pass a custom port:
   ```powershell
   npx vite --port 3000
   ```
2. Or edit `vite.config.ts` to change the `port` property.

---

## 5. Troubleshooting Common Issues

### Issue: Port 8080 is already in use
**Solution:** Check active ports in PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
```
Or start Vite on another port with `npm run dev -- --port 8081`.

### Issue: Resetting to Clean Demo State
If you tested data mutations and want to restore the clean seed state:
1. In the app, navigate to **Settings** (as Administrator).
2. Click **Reset demo data**.
3. You will be signed out, and browser `localStorage` will rehydrate with default enterprise assets.
