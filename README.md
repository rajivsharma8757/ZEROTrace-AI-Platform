# ZEROTrace AI

> **Secure Data Wiping and Trustworthy IT Asset Recycling Platform**  
> *Secure • Verify • Prove • Recycle*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![SIH 2026](https://img.shields.io/badge/SIH_2026-SIH25070-orange.svg)](#sih-project-context)

---

> [!IMPORTANT]
> **Hackathon Prototype & Safe Simulation Architecture:**  
> ZEROTrace AI is an enterprise-grade full-stack control plane platform developed for the **Smart India Hackathon 2026 (Problem Statement SIH25070)**.  
> The web application orchestrates multi-pass sanitization routines safely through a **simulated execution control plane**. It **does not execute raw physical disk-wiping commands** on host machines, guaranteeing complete safety during presentations and evaluations. Real hardware sanitization is designed for native agent daemons (`nvme-cli`, `hdparm`, blkdiscard) in Phase 2.

---

## 1. Executive Summary

**ZEROTrace AI** solves the dual crisis of enterprise data exposure and catastrophic electronic waste. 

When retired IT assets (laptops, workstations, enterprise servers, storage arrays) reach end-of-life, organizations frequently resort to destructive physical shredding because traditional formatting cannot guarantee zero data recovery. This destroys billions of dollars of functional hardware and accelerates global e-waste.

ZEROTrace AI introduces an unbroken, cryptographically verifiable **Trust Loop**:
1. **Intake & Asset Identity:** Digital registration of hardware, drive architecture (NVMe/SSD/HDD), capacity, and SED encryption states.
2. **Media-Aware AI Sanitization Guidance:** NIST SP 800-88 Rev. 2 and IEEE 2883-2022 heuristic engine recommending Purge vs. Clear vs. Cryptographic Erase routines.
3. **Control Plane Workflow Orchestration:** Step-by-step state machine with real-time progress, pass tracking, and status transitions.
4. **Independent Verification Gate:** Hard gate requiring multi-point sampled read validation and key disposition before certification.
5. **Cryptographic Erasure Certificates:** Issuance of tamper-evident digital certificates with SHA-256 hashes, scannable QR verification codes, and dynamic high-resolution PDF generation.
6. **Public Unauthenticated Verification Gateway:** Instant online verification at `/verify/:certificateId` for secondary buyers, auditors, and recyclers.
7. **Tamper-Evident SHA-256 Audit Trail:** Blockchain-style hash-chained event ledger (`previousHash` ➔ `currentHash`) with one-click verification.
8. **Circular ITAD Recycling Authorization:** Compliance gates ensuring only certified, verifiably sanitized hardware is released to authorized e-waste recyclers.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                       ZEROTrace AI                          │
       │           Secure • Verify • Prove • Recycle                 │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
        ┌──────────────┬──────────────┴──────────────┬──────────────┐
        ▼              ▼                             ▼              ▼
   [Register]    [AI Guidance]                  [Verify]        [Certify]
   Asset Intake   NIST 800-88 Heuristic        Sampled Reads    Tamper-Evident
   & Inventory    Media Capabilities           Key Check        Certificate & QR
```

---

## 2. Pre-Configured Demo Credentials

The platform includes a robust Role-Based Access Control (RBAC) model with dedicated portals for each role persona. Use any pre-configured demo account to sign in immediately:

| Role | Email | Password | Responsibilities & Scope |
| :--- | :--- | :--- | :--- |
| **Sovereign Owner** | Configured via `OWNER_EMAIL` | Configured via `OWNER_INITIAL_PASSWORD` | Platform governance, PostgreSQL health monitor, team distribution, cryptographic root authority |
| **Administrator** | `admin@zerotrace.demo` | `Admin@12345` | Operations flight deck, active wipe orchestration, asset disposition funnel, user provisioning |
| **Technician / Operator** | `operator@zerotrace.demo` | `Operator@12345` | Sanitization engineering workbench, real-time NIST 800-88 wipes, residual verification submission |
| **Auditor / Inspector** | `auditor@zerotrace.demo` | `Auditor@12345` | Independent proof inspection, SHA-256 chain verification, standards compliance checklist |
| **Customer / Client** | `customer@zerotrace.demo` | `Customer@12345` | Client asset tracking, tamper-evident certificate viewing, PDF download, public QR verification |

---

## 3. Technology Stack

### Frontend Application
- **Framework:** React `19.2.3` with TypeScript `5.5.3`
- **Build Tooling:** Vite `8.0.0` with `@vitejs/plugin-react-swc`
- **Styling:** Tailwind CSS `3.4.11` (dark cybersecurity enterprise theme: `#06101e` / `#0a1628` / cyan accent)
- **UI System:** shadcn/ui configured with Radix UI accessible primitives
- **Icons:** Lucide React (`0.462.0`)
- **Routing:** React Router DOM `6.30.4`
- **Client State:** Centralized typed API client (`src/lib/api.ts`) + reactive hook (`useAppData`)

### Backend API Server
- **Runtime:** Node.js `20+` / Express `4.21` / TypeScript
- **Database & ORM:** PostgreSQL 16 with Prisma ORM `5.22` (9 Relational Models)
- **Fallback Store:** Self-contained resilient database service (`dbStore.ts`) enabling instant zero-config startup even when Docker is offline
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing and role-based route middleware
- **QR Engine:** Genuine scannable PNG QR code generation (`qrcode`)
- **PDF Engine:** Dynamic official certificate generation with security border framing and embedded QR code (`pdfkit`)
- **Cryptography:** Node.js native `crypto` module (SHA-256 hash chains and certificate signatures)

---

## 4. Quick Start & Local Execution

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher
- *(Optional)* Docker Desktop (for standalone PostgreSQL container)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/rajivsharma8757/ZEROTrace-AI.git
cd ZEROTrace-AI
```

### Step 2 — Install Dependencies
```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3 — Optional: Start PostgreSQL via Docker
If Docker is installed, start the local PostgreSQL database:
```bash
docker compose up -d
cd backend
npx prisma generate
npx prisma db push
cd ..
```
*(Note: If Docker is not running, ZEROTrace AI automatically boots into its built-in resilient database mode with zero configuration needed).*

### Step 4 — Run Full-Stack Application
Start both the Express backend (port 5000) and Vite frontend (port 8080) simultaneously with one command:
```bash
node run-dev.js
```

Or run them in separate terminals:
```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev
```

### Step 5 — Open in Browser
- **Application Portal:** [http://localhost:8080](http://localhost:8080)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Public Verification Example:** [http://localhost:8080/verify/ZT-2026-8F1A92](http://localhost:8080/verify/ZT-2026-8F1A92)

---

## 5. End-to-End Acceptance Tests

A comprehensive 15-step end-to-end verification script is bundled to test the entire lifecycle:
```bash
python scratch/test_full_e2e.py
```

The test validates:
- [x] Backend API Health & CORS Headers
- [x] JWT Authentication & Token Issuance across all 4 RBAC Roles
- [x] Hardware Specification Intake & Storage Registration
- [x] Explainable NIST SP 800-88 Media Sanitization AI Analysis
- [x] Wipe Job Lifecycle (Queued ➔ Initializing ➔ Storage Detection ➔ Overwriting ➔ 100% Completed)
- [x] Automatic Verification Queue Insertion
- [x] Independent Cryptographic Sampled Read Verification (Pass / Fail)
- [x] Tamper-Evident SHA-256 Certificate Issuance
- [x] Dynamic Binary PDF Generation with Embedded Scannable QR Code
- [x] Unauthenticated Public Verification Route (`/api/certificates/:id/public`)
- [x] Sequential SHA-256 Cryptographic Audit Chain Integrity Check
- [x] Circular Economy ITAD Recycling Authorization
- [x] Full-Text Global Search across Assets, Wipe Jobs, and Certificates

---

## 6. Regulatory Standards Compliance

- **NIST SP 800-88 Rev. 2:** Guidelines for Media Sanitization (Clear, Purge, Destroy specifications).
- **IEEE 2883-2022:** Standard for Sanitizing Storage.
- **DoD 5220.22-M:** National Industrial Security Program Operating Manual (Legacy overwrite reference).
- **ISO/IEC 27001 (A.8.10 & A.8.14):** Information deletion and media disposal governance.
- **India E-Waste (Management) Rules, 2022:** CPCB/MoEFCC compliance and authorized recycler chain-of-custody transfer.

---

## 7. License & Security

- **License:** [MIT License](LICENSE)
- **Security Policy:** [SECURITY.md](SECURITY.md)
- **Contribution Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)
