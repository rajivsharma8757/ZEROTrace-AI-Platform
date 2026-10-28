# Known Limitations & Technical Constraints — ZEROTrace AI

This document provides a completely candid and transparent record of all current architectural, technical, and implementation limitations in the ZEROTrace AI codebase.

---

## 1. Sanitization & Hardware Execution

- **Simulation Only:**
  - The current web application **does not physically wipe or format hard drives**.
  - All sanitization progress, step progressions, and sector evidence are generated purely in-memory via JavaScript timers and state transitions in `src/pages/WipeJobs.tsx`.
  - This is an intentional security design choice for the web application; raw hardware destruction requires an external privileged agent daemon.

---

## 2. Persistence & Storage

- **Browser `localStorage` Dependency:**
  - All application data (organizations, users, devices, jobs, verifications, certificates, audit events) is stored inside the browser's `localStorage` under the key `"zerotrace-ai-prototype-v1"`.
  - **Risk:** Clearing browser cache, using Incognito/Private mode, or opening the application in a different browser will reset or segregate the data from the primary session.
  - **Capacity:** Browser `localStorage` is subject to a quota (typically ~5MB), which is sufficient for hundreds of demo assets but unsuitable for large-scale enterprise recordkeeping.

---

## 3. Authentication & Role Security

- **Client-Side Simulation:**
  - Authentication is purely a client-side convenience mechanism. Users select a demo persona (`Administrator`, `Employee / Operator`, `Customer`) in `Login.tsx`, and the user ID is saved to `localStorage.getItem("zerotrace-user")`.
  - No passwords or challenge-response cryptographic protocols are executed.
  - Role-based route protection (`<Protected roles={[...]} />`) runs entirely in the browser; an experienced user with browser Developer Tools can manipulate local storage or React component state.

---

## 4. Cryptographic Claims & Hash Chain

- **Non-Cryptographic Hash Algorithm:**
  - The audit log hash chain and certificate hashes are computed using a 32-bit Fowler–Noll–Vo (FNV-1a) variant (`ZT-xxxxxxxx`).
  - While mathematically illustrating the concept of a linked hash chain (`previousHash` -> `currentHash`), FNV-1a is **not a cryptographically collision-resistant hash function** (unlike SHA-256 or BLAKE3).
- **Client-Editable Ledger:**
  - Because the audit trail resides in `localStorage`, a local user can manually modify past events in the browser console. Immutable tamper-proofing requires an authoritative backend ledger or blockchain.

---

## 5. Visual & Export Limitations

- **Pseudo-QR Visual:**
  - The QR code on certificate cards is currently rendered using a procedural 9x9 CSS grid matrix (`Array.from({ length: 81 })`). It displays a visual representation of a QR pattern but is **not a standard scannable ISO/IEC 18004 barcode**.
- **Certificate Export Format:**
  - The "Download" action on certificates generates a plain-text metadata file (`.txt`) using browser `Blob` APIs, or triggers `window.print()`. A binary, tamper-resistant PDF with embedded digital signatures is not yet implemented.

---

## 6. Route & UI Completeness

- **Unrouted Specification Pages:**
  - The original specification mentions standalone `/reports` and `/notifications` routes. In the current implementation, notification data models exist in `src/lib/models.ts` and aggregate metrics appear on dashboard cards, but dedicated `/reports` and `/notifications` views have not yet been routed in `App.tsx`.
- **Legacy Fallback Template:**
  - `src/pages/Index.tsx` contains an unused starter template ("Welcome to Your Blank App"). The root route `/` in `App.tsx` redirects immediately to `/login`, so this fallback is never displayed to users.
