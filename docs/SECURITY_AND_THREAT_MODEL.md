# Security & Threat Model — ZEROTrace AI

## 1. Prototype Threat Model & Current Limitations

Because ZEROTrace AI is currently implemented as an in-browser prototype, it is critical to evaluate its security posture honestly. The prototype is designed for **demonstrating workflows and business logic**, not yet as an immutable security boundary.

### Current Limitations Analysis

| Threat / Risk Area | Prototype Implementation | Severity in Demo | Production Requirement |
| :--- | :--- | :--- | :--- |
| **Authentication Bypass** | Mock user selection in `Login.tsx`; User ID saved in `localStorage` | Low (Demo) | Cryptographically signed JWTs / HTTP-Only cookies with Argon2id password hashing |
| **Role Escalation** | Client-side React Router `<Protected>` component | Low (Demo) | Authoritative server-side middleware and PostgreSQL Row-Level Security (RLS) |
| **Data Tampering** | Application state lives in browser `localStorage` | Low (Demo) | Server-side database with strict write-audit triggers |
| **Hash-Chain Weakness** | 32-bit FNV-1a hash algorithm (`ZT-xxxxxxxx`) | Informational | Cryptographically secure SHA-256 / SHA-3 hash chain or Merkle Tree |
| **Physical Disk Safety** | Pure simulation engine; no disk commands executed | Zero (Safe) | Local execution daemon with target-disk fingerprinting and double confirmation |

---

## 2. STRIDE Threat Analysis (Future Production System)

The table below outlines the STRIDE evaluation for the complete three-plane production architecture (Web Dashboard, Backend API, Local Agent):

### S — Spoofing Identity
- **Threat:** Malicious actor impersonates an authorized sanitization operator or local wiping agent.
- **Mitigation:**
  - Web users: Mandatory MFA / enterprise SSO (OIDC/SAML).
  - Local wiping agent: Mutual TLS (mTLS) with per-agent X.509 client certificates and TPM-backed hardware keys.

### T — Tampering with Data
- **Threat:** An operator or rogue technician edits a wipe record from `FAILED` to `VERIFIED` in database or network transit.
- **Mitigation:**
  - TLS 1.3 encryption on all transit.
  - Verification results are submitted directly by the local agent daemon with raw sector telemetry.
  - Append-only audit ledger with cryptographic SHA-256 hash chaining.

### R — Repudiation
- **Threat:** An organization claims a sanitized asset was never certified, or an operator denies issuing a certificate.
- **Mitigation:**
  - Every certificate is signed using asymmetric Ed25519 private keys held by the Certificate Authority service.
  - Public verification records log timestamped verification signatures.

### I — Information Disclosure
- **Threat:** Customer A inspects asset serial numbers, organizational data, or drive contents belonging to Customer B.
- **Mitigation:**
  - Multi-tenant data isolation enforced by PostgreSQL Row-Level Security (`organizationId = current_org()`).
  - Public verification route (`/verify/:id`) exposes only safe public metadata (Device Name, Asset ID, Method, Hash, Status) and strips internal employee IDs or serial numbers.

### D — Denial of Service
- **Threat:** Rapid requests to public verification endpoints or agent heartbeats exhaust server resources.
- **Mitigation:**
  - Reverse proxy rate-limiting (e.g. Nginx / Cloudflare).
  - Cached public verification responses in Redis or CDN edge.

### E — Elevation of Privilege
- **Threat:** A Customer role attempts to access `/admin-dashboard` or approve recycling.
- **Mitigation:**
  - Strict RBAC middleware on all backend API routes. Client-side route blocking is purely a UI convenience; server enforces role authorization on every single API payload.

---

## 3. Physical Storage & Sanitization Safety Rules

When the Phase 2 Local Sanitization Agent is deployed to real physical hardware:

1. **Target Disk Confirmation:**
   - The agent MUST display the model, bus path, serial number, partition layout, and capacity.
   - The agent MUST require explicit confirmation by typing the full target device serial number before executing destructive commands.
2. **OS Drive Lockout:**
   - The agent MUST detect the mounted root/boot filesystem (`/` on Linux, `C:` on Windows) and permanently disable sanitization actions against the host OS drive.
3. **Firmware-Level Commands:**
   - For NVMe: Utilize `nvme format /dev/nvmeXn1 --ses=1` (User Data Erase) or `--ses=2` (Cryptographic Erase).
   - For SATA SSD: Utilize ATA Secure Erase / Enhanced Secure Erase via `hdparm`.
   - For HDD: Multi-pass pseudo-random overwrite with zero-fill final pass under NIST SP 800-88 Clear/Purge standards.
