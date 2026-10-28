# Features & Functional Specification — ZEROTrace AI

This document provides a comprehensive feature-by-feature inventory of the ZEROTrace AI platform, distinguishing confirmed functional implementations from simulated workflows and future roadmap items.

---

## Feature Matrix

| Feature Module | Implementation Status | Execution Level | Security / Fidelity Level |
| :--- | :--- | :--- | :--- |
| **Role-Based Authentication** | Implemented | Client-Side (`localStorage`) | Demo mode (no passwords) |
| **Executive Overview (Admin)** | Implemented | Client-Side React | Real-time counts & charts |
| **Operator Workspace** | Implemented | Client-Side React | Assigned device filtering |
| **Customer Portal** | Implemented | Client-Side React | Strict customer asset isolation |
| **Device Registration** | Implemented | Form + Schema Validation | Full asset metadata capture |
| **AI Sanitization Recommendations** | Implemented | Deterministic Heuristic Engine | Media-aware NIST 800-88 rules |
| **Sanitization Lifecycle** | Simulated | Step-wise state machine | Safe visual simulation |
| **Evidence Verification Queue** | Implemented | Operator decision interface | Manual Pass / Fail review |
| **Digital Certificate Issuance** | Implemented | Unique ID + Hash generator | Printable + `.txt` export |
| **QR Code Public Verification** | Implemented | Unauthenticated public route | 9x9 CSS visual matrix |
| **Tamper-Evident Audit Trail** | Implemented | FNV-1a Hash Chain | Previous -> current hash linking |
| **Recycling Approvals** | Implemented | Multi-condition authorization | Gatekeeper for disposition |
| **Data Reset Control** | Implemented | Settings action | Deterministic seed recovery |
| **Automated Reports Export** | Partial / Planned | Dashboard metrics only | Standalone CSV/PDF planned |
| **Real Hardware Disk Wiping** | Planned (Phase 2) | OS Agent Daemon | Not in current web app |

---

## Detailed Feature Specifications

### 1. Multi-Portal Role-Based Authentication
- **Administrator (`admin@zerotrace.demo`):**
  - Full system governance, aggregate asset status, certificate issuance/revocation, audit trail inspection, recycling approvals, and demo reset.
- **Employee / Operator (`operator@zerotrace.demo`):**
  - Operational queue management, asset intake/registration, simulated wipe execution, and post-sanitization evidence review.
- **Customer (`customer@zerotrace.demo`):**
  - Customer-specific portal strictly isolated to owned hardware. Can view sanitization milestones, inspect issued certificates, trigger print/download, and test public verification links. Strictly gated from administrative screens.

### 2. Device Intake & Inventory Management
- **Asset Fields:**
  - Asset ID (e.g. `APX-LT-1042`), Device Name, Manufacturer/Model, Serial Number, Operating System.
  - Media/Storage Type: `NVMe`, `SSD`, `HDD`.
  - Storage Capacity (GB), Hardware Encryption Status (`Enabled` / `Disabled`), Health Status (`Excellent`, `Good`, `Attention`).
- **Interactive Inspection:**
  - Selecting any device displays an inspection pane showing hardware specifications, assigned operator, ownership, and dynamic AI recommendation.

### 3. Media-Aware AI Sanitization Recommendations
- Evaluates physical drive parameters through a deterministic rule-based decision algorithm (`recommendation()` in `src/lib/data.ts`):
  - **NVMe / SSD with Encryption:** NIST 800-88 Purge (*Cryptographic Erase*). Estimated duration: ~8–12 min. Strategy: Key disposition + sampled read verification. Confidence: 94%.
  - **SSD without Encryption:** NIST 800-88 Purge (*Block Erase / Firmware Purge*). Strategy: Multi-pass sampled read verification. Confidence: 86%.
  - **Magnetic HDD:** NIST 800-88 Purge (*Multi-pass Overwrite*). Estimated duration proportional to capacity (~1 hr per 100 GB).

### 4. Safe Simulated Wipe Engine
- Visualizes the 6 standard stages of media sanitization:
  1. `INITIALIZING` (0–16%)
  2. `DETECTING_STORAGE` (17–33%)
  3. `PREPARING_SANITIZATION` (34–50%)
  4. `SANITIZING` (51–67%)
  5. `FINALIZING` (68–83%)
  6. `VERIFICATION_PREPARATION` (84–100%)
- Includes persistent safety notice: *"Simulation only: progress and evidence are locally generated for prototype demonstration. ZEROTrace AI does not execute physical disk deletion commands."*

### 5. Verification Queue
- Assets completing sanitization enter `VERIFICATION_PENDING`.
- Operators inspect recorded evidence (sector read sampling results, cryptographic key destruction confirmation).
- Operator triggers **Pass** (transitions asset to `VERIFIED`) or **Fail** (transitions asset to `FAILED`, preventing certification).

### 6. Digital Erasure Certificates
- Issued only for `VERIFIED` devices.
- Contains:
  - Unique Certificate ID (`ZT-2026-XXXXXX`).
  - Linked Asset ID, Serial Number, Storage Type, and Wipe Method.
  - Calculated Verification Hash.
  - Issue Date and Authorized Issuer ID.
  - Validity Status (`VALID` or `REVOKED`).
- Actions: Download Certificate (`.txt` metadata blob), Print view (`window.print()`), Admin revocation.

### 7. QR-Based Public Verification
- Public URL route: `/verify/:certificateId`.
- Completely accessible without authentication.
- Evaluates the certificate ID against the storage ledger:
  - If valid: Displays green verification seal, asset tag, sanitized hardware specs, wipe method, and cryptographic hash.
  - If revoked: Displays warning banner stating certificate was revoked.
  - If invalid: Displays red alert stating certificate was not found in the registry.

### 8. Tamper-Evident Hash Chain Audit Log
- Every action (Login, Device Registered, Wipe Started, Wipe Completed, Verification Completed, Certificate Generated, Certificate Revoked, Recycling Approved) generates an audit entry.
- Each entry contains: `id`, `action`, `actorId`, `entityType`, `entityId`, `details`, `timestamp`, `previousHash`, and `currentHash`.
- Current hash is generated by hashing `${previousHash}|${action}|${entityId}|${details}|${timestamp}`.

### 9. Downstream Recycling Approval Gate
- Provides a strict compliance gatekeeper before hardware can be handed over to registered e-waste recyclers.
- Hardware must satisfy three preconditions:
  1. Sanitization status is `COMPLETED`.
  2. Verification result is `PASS`.
  3. Certificate is issued and `VALID`.
- Once approved, asset status updates to `READY_FOR_RECYCLING` with auditor notes and timestamps logged to the audit chain.
