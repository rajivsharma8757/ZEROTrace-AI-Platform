# ZEROTrace AI — Authentication, Team Roles, Owner Access & Email Delivery Guide

This document details the configuration and architecture for the production-grade authentication, role-based access control (RBAC), owner bootstrapping, email delivery, and Google OAuth services implemented in ZEROTrace AI.

---

## 1. Owner Account Provisioning & Protection

### The Project Owner: Rajiv Kumar Sharma

- **Configuration:** The Owner's email is provisioned securely via the server-side environment variable `OWNER_EMAIL` in `backend/.env`.
- **Zero Frontend Leakage:** The Owner email is never exposed in the client-side bundle or logged to public streams.
- **Bootstrap Process:** When the backend starts up, it inspects `OWNER_EMAIL`. If the account exists, it ensures `role: OWNER`, `emailVerified: true`, and `status: ACTIVE`. If it does not exist, it securely creates the verified account with `OWNER` privileges and hashes the initial password using `bcrypt` (10 rounds).
- **Protection Rules:**
  1. The last active `OWNER` cannot be deleted, deactivated, or demoted.
  2. An `ADMINISTRATOR` or any other non-Owner role cannot promote themselves or anyone else to `OWNER`.
  3. Only an authorized `OWNER` can promote a user to `OWNER` or invite a new `OWNER`.
  4. Public self-registration always receives the least-privileged `USER` role.

---

## 2. Six-Role Hierarchy & Permission Matrix

ZEROTrace AI implements 6 distinct team roles:

| Role | Target Persona | Permissions & Scope |
| :--- | :--- | :--- |
| **Owner** | Rajiv Kumar Sharma / Organization Principal | Complete organization control, owner settings, user administration, privileged role promotion, and full platform access. |
| **Administrator** | Compliance & Operations Leads | Operational management, device inventory, sanitization oversight, reports, audit trails, and user management (cannot promote to Owner). |
| **Creator** | Asset Intake Specialists / Procurement | Register incoming decommissioned devices, initialize inventory records, view asset reports. |
| **Author** | Technical Writers / Compliance Documenters | Edit sanitization records, review certificates, export compliance summaries. |
| **Technician** | Sanitization Engineers / Hardware Operators | Perform device diagnostics, execute NIST SP 800-88 sanitization wipe jobs, run residual scans, and submit verification evidence. |
| **User** | Client Enterprise Owners / End Customers | Access only assigned devices and issued certificates, track sanitization progress, perform public QR verification. |

---

## 3. Email Delivery Service (SMTP & Development Outbox)

The backend includes a real `EmailService` powered by `nodemailer`.

### Server Environment Variables (`backend/.env`)

```ini
# Production SMTP Provider (e.g. Amazon SES, SendGrid, Mailgun, Brevo, or corporate SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="ZEROTrace AI Security" <security@zerotrace.ai>
FRONTEND_URL=http://localhost:8080
```

### Development & Test Outbox
When SMTP credentials are left blank (e.g. during local offline development or CI test runs):
- Outgoing emails are queued into `backend/data/email_outbox.json` (or `data/email_outbox.json`).
- Each email record includes `to`, `subject`, `token`, `link`, `type`, and `sentAt`.
- Enables automated end-to-end testing of verification and reset tokens without requiring live outbound internet traffic.

---

## 4. Google OAuth 2.0 Integration

### Frontend Configuration (`.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend Configuration (`backend/.env`)
```ini
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Real Google Sign-In Flow
1. User clicks **"Continue with Google"** on `/login` or `/register`.
2. Google Identity Services displays the Google account chooser and returns a signed ID token (`credential`).
3. Frontend dispatches `{ credential }` to `POST /api/auth/google`.
4. Backend verifies cryptographic signature, issuer, audience (`GOOGLE_CLIENT_ID`), and `email_verified` using `google-auth-library`.
5. If the Google account matches an existing user, it links `googleId` and logs in with their existing role.
6. If it is a first-time sign-in, it registers the user with least-privileged role `USER` (or `OWNER` if matching `OWNER_EMAIL`).

---

## 5. PostgreSQL & Prisma Persistence

- **Container:** Docker container `zerotrace-postgres` running PostgreSQL 16 on `localhost:5432`.
- **Database URL:** `postgresql://postgres:postgres@localhost:5432/zerotrace?schema=public`
- **Tables:** `users`, `invitations`, `password_reset_tokens`, `email_verification_tokens`, `assets`, `wipe_jobs`, `verification_results`, `certificates`, `audit_logs`, `notifications`, `recycling_approvals`, `organizations`.
- **Migration & Client Generation:**
  ```powershell
  cd backend
  npx prisma db push
  npx prisma generate
  ```

---

## 6. Commands to Start / Restart the Application

### 1. Verify PostgreSQL Docker Container
```powershell
docker ps
# If stopped:
docker compose up -d
```

### 2. Start Backend API Server (Port 5000)
```powershell
cd C:\Users\Lenovo\dyad-apps\zero-trace-ai\backend
npm run dev
# OR for production build:
npm run build
npm start
```

### 3. Start Frontend Development Server (Port 8080/8081)
```powershell
cd C:\Users\Lenovo\dyad-apps\zero-trace-ai
npm run dev
```

### 4. Run the Full Test Suites
```powershell
# Auth & Team Access E2E Test Suite (16/16 tests)
python C:\Users\Lenovo\.gemini\antigravity\brain\90222829-3507-494c-9e65-6b46f8ff163f\scratch\test_auth_team_e2e.py

# Full-Stack Workflow E2E Test Suite (15/15 tests)
python C:\Users\Lenovo\.gemini\antigravity\brain\90222829-3507-494c-9e65-6b46f8ff163f\scratch\test_full_e2e.py
```
