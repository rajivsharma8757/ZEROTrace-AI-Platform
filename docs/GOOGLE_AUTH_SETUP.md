# Google OAuth 2.0 Integration & Setup Guide — ZEROTrace AI

This guide documents how Google Authentication is configured and how to set up production Google OAuth 2.0 credentials in the Google Cloud Console for ZEROTrace AI.

---

## 1. Architecture Overview

ZEROTrace AI provides a unified, enterprise authentication system supporting:
- Standard Email / Password authentication with bcrypt hashing.
- Google OAuth 2.0 Single Sign-On ("Continue with Google") with Google Identity Services.
- Automatic Role Mapping & Portal Dispatch (`/portal` -> `/admin`, `/employee`, `/customer`).
- Built-in resilient demo mode for offline Smart India Hackathon (SIH) evaluators.

---

## 2. Setting Up Google Cloud Console

To enable live Google OAuth sign-in:

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name the project `ZEROTrace-AI` and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (or **Internal** for Workspace organizations) and click **Create**.
3. Fill in the App Information:
   - **App name**: `ZEROTrace AI`
   - **User support email**: Your development or support email.
   - **Developer contact information**: Your email.
4. Add Scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Add Test Users (e.g., your Google account) if the publishing status is "Testing".
6. Save and continue.

### Step 3: Create OAuth 2.0 Client Credentials
1. In the sidebar, navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Select **Web application** as the application type.
4. Configure **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:5000
   https://your-production-domain.com
   ```
5. Configure **Authorized redirect URIs**:
   ```
   http://localhost:5173/portal
   http://localhost:5173/login
   https://your-production-domain.com/portal
   ```
6. Click **Create** and copy the generated **Client ID** and **Client Secret**.

---

## 3. Environment Variables Configuration

Add the generated credentials to your environment files:

### Frontend (`.env` or `.env.local` in project root)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=zerotrace_jwt_secret_sih2026_production_grade
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zerotrace?schema=public"
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 4. SIH Offline / Demo Resiliency

To guarantee that judges and evaluators at hackathon venues are never blocked by firewall restrictions, missing internet, or unconfigured Google credentials:
- If `VITE_GOOGLE_CLIENT_ID` is not present, clicking **Continue with Google** automatically signs into a verified demonstration identity.
- Evaluators can also use the **SIH Hackathon Quick Demo Logins** accordion at the bottom of the `/login` card to switch between **Administrator**, **Operator**, **Auditor**, and **Customer** in one click.

---

## 5. Security & Verification
- All tokens issued by Google or the native authentication system are validated with SHA-256 integrity and tied to the immutable audit ledger.
- Sessions are protected via JWT with expiry and role governance.
