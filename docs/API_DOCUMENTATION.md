# API Documentation & Specifications — ZEROTrace AI

## Current Status: Client-Only Architecture

> **CRITICAL ARCHITECTURAL NOTICE:**
> The current ZEROTrace AI repository **does not run a backend server or expose network HTTP endpoints**.
> All data read, write, state transitions, and hash calculations are executed client-side via JavaScript functions in `src/lib/data.ts` and saved to browser `localStorage`.

The specifications below represent the **target REST API design** planned for Phase 2 when transitioning to an Express.js / Fastify backend service with PostgreSQL.

---

## Planned REST API Endpoints (Phase 2 Specification)

Base URL: `https://api.zerotrace.internal/v1`

### 1. Authentication & Session

#### `POST /auth/login`
Authenticates a user and returns a signed JWT or sets an HTTP-only secure cookie.
- **Request Body:**
  ```json
  {
    "email": "operator@zerotrace.demo",
    "password": "string"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "usr-operator",
      "name": "Riley Patel",
      "email": "operator@zerotrace.demo",
      "role": "EMPLOYEE"
    }
  }
  ```

#### `GET /auth/me`
Retrieves currently authenticated session identity.

---

### 2. Device Management

#### `GET /devices`
Lists devices accessible to the requesting role (Customers only receive their owned devices; Administrators receive all organization devices).
- **Query Parameters:** `status`, `storageType`, `limit`, `offset`
- **Response `200 OK`:** Array of `Device` objects.

#### `POST /devices`
Registers a new asset into custody.
- **Roles Allowed:** `ADMIN`, `EMPLOYEE`
- **Request Body:**
  ```json
  {
    "assetId": "APX-LT-2050",
    "name": "ThinkPad P16s Gen 2",
    "type": "Laptop",
    "serialNumber": "PF-49X810",
    "operatingSystem": "Windows 11 Pro",
    "storageType": "NVMe",
    "capacityGb": 1024,
    "encryption": "Enabled",
    "ownerId": "usr-customer"
  }
  ```

---

### 3. Sanitization & Wipe Jobs

#### `POST /wipe-jobs`
Initiates or schedules a sanitization job.
- **Roles Allowed:** `ADMIN`, `EMPLOYEE`
- **Request Body:**
  ```json
  {
    "deviceId": "dev-1001",
    "method": "NIST 800-88 Purge (cryptographic erase)",
    "securityLevel": "High"
  }
  ```

#### `POST /agent/wipe-jobs/:id/heartbeat`
Endpoint for the secure local execution agent to stream progress, phase updates, and sector sampling results.
- **Authorization:** Mutual TLS or Agent Secret Key.

---

### 4. Verification Queue

#### `POST /verifications/:id/decision`
Records operator approval or rejection of sanitization evidence.
- **Roles Allowed:** `ADMIN`, `EMPLOYEE`, `AUDITOR`
- **Request Body:**
  ```json
  {
    "result": "PASS",
    "evidenceNotes": "Sampled reads across 24 sectors returned 0x00 pattern. Key shredding verified via TPM."
  }
  ```

---

### 5. Certificates & Public Verification

#### `POST /certificates`
Issues a digital sanitization certificate for an eligible verified asset.
- **Roles Allowed:** `ADMIN`, `EMPLOYEE`
- **Request Body:**
  ```json
  {
    "verificationId": "ver-1001"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "certificateId": "ZT-2026-8F1A92",
    "hash": "ZT-44b9cc1d",
    "status": "VALID",
    "issuedAt": "2026-10-28T15:00:00Z"
  }
  ```

#### `GET /certificates/:id/public` (Public / Unauthenticated)
Public endpoint called when scanning a certificate QR code or visiting `/verify/:certificateId`.
- **Response `200 OK` (Valid):**
  ```json
  {
    "status": "VALID",
    "certificateId": "ZT-2026-8F1A92",
    "assetId": "APX-LT-1042",
    "deviceName": "Latitude 7440",
    "wipeMethod": "NIST 800-88 Clear",
    "verificationResult": "PASS",
    "issuedAt": "2026-08-22T08:25:00Z",
    "hash": "ZT-44b9cc1d"
  }
  ```
- **Response `404 Not Found`:** If certificate ID is invalid or unregistered.

---

### 6. Audit Trail

#### `GET /audit-trail`
Retrieves chronological tamper-evident audit records.
- **Roles Allowed:** `ADMIN`, `AUDITOR`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "audit-abc123",
      "action": "CERTIFICATE_GENERATED",
      "actorId": "usr-admin",
      "entityId": "ZT-2026-8F1A92",
      "details": "Certificate issued for APX-LT-1042",
      "timestamp": "2026-10-28T15:00:00Z",
      "previousHash": "ZT-44b9cc1d",
      "currentHash": "ZT-79e110b2"
    }
  ]
  ```
