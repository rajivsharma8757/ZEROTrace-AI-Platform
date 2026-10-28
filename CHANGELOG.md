# Changelog — ZEROTrace AI

All notable changes to the ZEROTrace AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-prototype] — 2026-10-28

### Added
- **Role Portals & Role-Based Navigation:**
  - Executive Overview for `ADMIN` with system-wide device stats, active jobs, verification counts, and certificate tallies.
  - Operator Command Center for `EMPLOYEE` with assigned devices, pending wipe queues, and active simulation controls.
  - Customer Workspace for `CUSTOMER` with strict asset isolation (only viewing owned hardware and issued certificates).
- **Device Management & Inventory:**
  - Asset registration dialog supporting asset tags, serial numbers, OS, media type (SSD/HDD/NVMe), capacity, and hardware encryption state.
  - Interactive inventory table with status indicators and detailed device inspection sidebar.
- **AI Sanitization Recommendation Engine:**
  - Media-aware rule-based heuristic calculating recommended NIST 800-88 method (Clear vs. Purge / Cryptographic Erase), duration estimate, security tier, and confidence score.
- **Simulated Wipe Orchestrator:**
  - 6-phase sanitization lifecycle simulation (Initializing, Storage Detection, Sanitization Preparation, Sanitizing, Finalizing, Verification Preparation).
  - Prominent safety disclaimer banners preventing confusion with real physical disk erasure.
- **Sanitization Verification Workflow:**
  - Post-wipe review queue enabling operators to record Pass/Fail decisions on cryptographic erase evidence and sampled sector reads.
- **Digital Sanitization Certificates:**
  - Certificate generation for verified assets with unique certificate identifiers, device attributes, and verification hashes.
  - Visual pseudo-QR matrix pattern on certificate cards.
  - Single-click plain text certificate export and browser print trigger.
  - Administrator certificate revocation capability.
- **Public Verification Endpoint:**
  - Public route (`/verify/:certificateId`) allowing external third parties to inspect certificate validity without logging in.
- **Tamper-Evident Audit Trail:**
  - Hash chain event logger linking chronological lifecycle actions (`previousHash` -> `currentHash`).
- **Recycling Gatekeeper:**
  - Explicit authorization gate requiring completed wipe + passing verification + valid certificate before marking assets `READY_FOR_RECYCLING`.
- **Engineering & GitHub Documentation Pack:**
  - Comprehensive `README.md`, SIH problem alignment documentation, architecture diagrams, threat models, testing reports, demo guides, and deployment configurations.
