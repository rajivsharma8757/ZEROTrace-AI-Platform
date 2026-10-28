# Smart India Hackathon (SIH) Presentation Outline — ZEROTrace AI

**Problem Statement:** `SIH25070` — *Secure Data Wiping for Trustworthy IT Asset Recycling*  
**Theme:** Cybersecurity / Sustainable IT | **Category:** Software | **Team:** ZeroTrace

---

## Slide 1: Title & Identity
- **Project Title:** ZEROTrace AI
- **Subtitle:** Secure Data Wiping and Trustworthy IT Asset Recycling Platform
- **Tagline:** *Secure. Verify. Prove. Recycle.*
- **Problem Statement ID:** `SIH25070`
- **Category & Theme:** Software | Cybersecurity / Sustainable IT
- **Team Name:** ZeroTrace
- **Team Members & Mentor:** *[Insert Student Names, College/Institution, and Mentor]*

---

## Slide 2: Problem Statement & Context
- Millions of enterprise and institutional IT assets are retired annually across India and globally.
- Fear of residual data leakage causes companies to physically shred functional laptops and servers.
- When hardware is handed to recyclers without verification, unformatted or quick-formatted drives risk catastrophic data breaches.
- **Global Context:** 62 Mt of e-waste in 2022, projected to 82 Mt by 2030 (*Global E-waste Monitor 2024*); only 22.3% documented as properly collected.
- **Regulatory Mandate:** India's *E-Waste (Management) Rules, 2022* (CPCB/MoEFCC) require registered recyclers, complete traceability, and verified environmentally sound management.

---

## Slide 3: Existing Challenges & Gaps
1. **The Format Fallacy:** Standard OS "Format" only deletes pointer tables; data remains fully recoverable.
2. **Flash Memory Incompatibility:** Traditional multi-pass overwrite (DoD 5220.22-M) degrades SSDs and fails to sanitize wear-leveled flash blocks.
3. **No Chain of Custody:** Lack of a centralized audit trail connecting the physical device to the technician who wiped it.
4. **Unverifiable Certificates:** Paper or static PDF certificates are trivial to photoshop and lack cryptographic verification.

---

## Slide 4: Proposed Solution — ZEROTrace AI
- A centralized platform to register, sanitize, verify, and release end-of-life IT assets.
- **Media-Aware Guidance:** Automatically selects NIST SP 800-88 Rev. 2 compliant sanitization methods based on drive type (NVMe, SSD, HDD).
- **Separation of Concerns:** Web dashboard serves as the Control Plane; raw hardware wiping is delegated to an isolated execution agent.
- **Verification Gate:** No certificate is issued until verification (sampled reads and key shredding) passes.
- **Public Proof:** Digital certificates with QR codes for instant, unauthenticated public verification by secondary buyers and recyclers.

---

## Slide 5: System Architecture (The Three Planes)
- **Control Plane:** Web Dashboard (React 19, TypeScript, Tailwind CSS, shadcn/ui) + PostgreSQL state.
- **Execution Plane:** Local Sanitization Agent (safe simulation in current prototype; Go/Python daemon interfacing with `nvme-cli` and `hdparm` in Phase 2).
- **Evidence Plane:** Verification review queue + tamper-evident hash chain + public verification endpoint (`/verify/:id`).

---

## Slide 6: Key Features & Capabilities
1. **Three Role Portals:** Dedicated views for Administrator, Operator, and Customer with strict tenant isolation.
2. **Device Management:** Full hardware intake (Serial, Asset Tag, OS, Media, Capacity, Encryption).
3. **AI Recommendation Engine:** Media-aware heuristics recommending NIST Purge / Clear with duration and confidence estimates.
4. **Simulated Wipe Lifecycle:** 6-phase visual progress tracking with safety notices.
5. **Independent Verification:** Operator Pass/Fail gate on evidence.
6. **Digital Certificates:** Unique IDs, hashes, print and download capability.
7. **Tamper-Evident Audit Trail:** Event hash chain (`previousHash` -> `currentHash`).
8. **Recycling Authorization:** Precondition-gated release for circular e-waste disposition.

---

## Slide 7: Live Workflow Demonstration
- **Intake:** Register asset `APX-LT-1042` (NVMe SSD).
- **AI Recommendation:** NIST 800-88 Purge (Cryptographic Erase) recommended with 94% confidence.
- **Simulate:** Start wipe and advance through 6 sanitization phases.
- **Verify:** Review sector sampling evidence and issue **PASS**.
- **Certify:** Generate certificate `ZT-2026-XXXXXX`.
- **Public Verification:** Scan/open public verify URL without login.
- **Recycle:** Approve asset for certified downstream recycling.

---

## Slide 8: Security & Trust Model
- **Defense in Depth:** Complete separation of browser UI from raw kernel disk-write commands.
- **Verification Gating:** Certification code path strictly requires `status === 'VERIFIED'`.
- **Tenant Isolation:** Customers only access owned assets; zero visibility into administrative queues.
- **Audit Immutability:** Event ledger chaining previous and current hashes.
- **Production Target:** Transitioning to asymmetric Ed25519 digital signatures and SHA-256 Merkle trees.

---

## Slide 9: Technical Innovation & Differentiation
| Feature | Traditional Wiping Tools | ZEROTrace AI |
| :--- | :--- | :--- |
| **Media Awareness** | Generic multi-pass overwrite | Media-aware (NVMe / SSD crypto-erase vs HDD) |
| **Verification Gate** | Often manual or omitted | Mandatory digital verification before certificate |
| **Certificate Trust** | Static, easily forged PDFs | Cryptographically hashed + Public QR verification |
| **Recycling Integration**| Disconnected from recycling | Integrated approval gatekeeper for circular IT |
| **Architecture** | Monolithic local utility | Modern 3-Plane Cloud Control + Local Agent |

---

## Slide 10: Feasibility & Viability
- **Technical Feasibility:** Built on standard, battle-tested web technologies (React, TypeScript, Vite) with clear separation for native OS agents (`nvme-cli`, `hdparm`).
- **Operational Feasibility:** Minimal operator training required; intuitive step-by-step workflow with clear confirmation steps.
- **Economic Viability:** Open-source foundation eliminates expensive per-seat proprietary ITAD software licensing fees.

---

## Slide 11: Limitations & Risk Mitigation
- **Current Limitation:** Prototype runs client-side simulation using browser `localStorage`.
  - *Mitigation:* Explicitly labeled in the UI; architectural design cleanly abstracts data layer for PostgreSQL migration.
- **Risk: Wrong-Disk Erasure on Real Hardware:**
  - *Mitigation:* Local agent requires explicit target confirmation by typing device serial number; host OS drive is automatically locked out.

---

## Slide 12: Implementation Roadmap
- **Phase 1 (Current):** Functional Control Plane prototype, role portals, simulated wiping, hash chain, and QR verification.
- **Phase 2 (Near-Term):** Node.js / Express backend with PostgreSQL, and native Go/Python wiping agent daemon.
- **Phase 3 (Medium-Term):** Asymmetric Ed25519 digital signatures, real scannable QR generation, and automated PDF certification.
- **Phase 4 (Enterprise Scale):** Multi-tenant enterprise cloud, CPCB compliance reporting, and ERP / ITAD inventory integration.

---

## Slide 13: Expected Social, Economic & Environmental Impact
- **Cybersecurity & Data Privacy:** Eliminates residual data leakage risks under the Digital Personal Data Protection Act (DPDPA).
- **Economic Value:** Enables safe resale, refurbishment, and donation of secondary IT hardware instead of premature physical destruction.
- **Circular IT & Environment:** Extends hardware lifespan, conserves rare-earth minerals, and supports India's circular economy goals under the E-Waste Rules 2022.

---

## Slide 14: Conclusion & Q&A
- ZEROTrace AI bridges the critical gap between data security and sustainable IT asset recycling.
- *Secure the data. Verify the proof. Empower the circular economy.*
- **Open for Questions & Discussion.**
