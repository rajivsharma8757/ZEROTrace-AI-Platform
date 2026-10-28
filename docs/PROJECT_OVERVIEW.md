# Project Overview — ZEROTrace AI

## Executive Summary

**ZEROTrace AI** is an operational cybersecurity and circular IT governance platform designed to bring verifiable trust, media-appropriate sanitization, and cryptographic accountability to end-of-life IT asset recycling.

Developed in direct response to **Smart India Hackathon (SIH) Problem Statement SIH25070** (*"Secure Data Wiping for Trustworthy IT Asset Recycling"*), ZEROTrace AI closes the critical governance gap between physical asset retirement and authorized downstream recycling or refurbishment.

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

## The Core Problem

Every year, enterprises, educational institutions, government bodies, and data centers retire millions of IT assets (laptops, desktops, enterprise servers, NVMe storage blades).
- **The Risk:** Incomplete sanitization (relying on basic OS formatting, deletion, or quick partition removal) leaves sensitive proprietary data, personal identifiable information (PII), or confidential corporate records exposed to recovery.
- **The E-Waste Crisis:** Due to fear of data leakage, organizations frequently resort to destructive physical shredding of functional hardware that could otherwise be refurbished, reused, or responsibly recycled.
- **The Global Impact:** According to the **UN/ITU Global E-waste Monitor 2024**, 62 million metric tonnes (Mt) of e-waste were generated in 2022, projected to rise to 82 Mt by 2030, with only 22.3% documented as properly collected and recycled.
- **Indian Regulatory Mandate:** The **E-Waste (Management) Rules, 2022** issued by the Ministry of Environment, Forest and Climate Change (MoEFCC) and Central Pollution Control Board (CPCB) mandate strict environmental accountability, registered recycler partnerships, and complete chain-of-custody tracking.

---

## The ZEROTrace AI Solution

ZEROTrace AI introduces an end-to-end **Trust Loop**:
1. **Custody & Asset Registration:** Track hardware identity (Asset ID, Serial Number, OS, Media Type, Capacity, Encryption).
2. **Media-Aware Sanitization Guidance:** Rule-based recommendation engine informed by NIST SP 800-88 Rev. 2 guidance, differentiating between magnetic HDDs (multi-pass overwrite) and solid-state NVMe/SSDs (cryptographic erase / firmware purge).
3. **Simulated Control Plane (Current Prototype):** A secure dashboard orchestrator visualizing multi-phase sanitization workflows without exposing host drives to unverified commands.
4. **Independent Verification Gate:** Mandatory validation of cryptographic key disposition and sampled sector integrity before certification.
5. **Tamper-Evident Certification:** Issuance of digital erasure certificates bearing unique IDs, cryptographic verification hashes, and public verification endpoints.
6. **QR-Based Public Verification:** Instant verification of certificate validity via a public route (`/verify/:certificateId`) accessible to downstream refurbishers and auditors without administrative credentials.
7. **Tamper-Evident Audit Trail:** Event logging linked through a sequential hash chain (`previousHash` -> `currentHash`).
8. **Recycling Authorization Gate:** Formal gatekeeper preventing any asset from being released for downstream recycling until sanitization and verification are mathematically proven.

---

## Current Status: Prototype & Control Plane Simulation

| Component | Current Implementation | Production Target |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui | Production Web App |
| **State & Persistence** | Browser `localStorage` with deterministic seed dataset | PostgreSQL + Prisma ORM |
| **Authentication** | Client-side demo role selector (`ADMIN`, `EMPLOYEE`, `CUSTOMER`) | JWT / OAuth2 / Argon2 password hashing |
| **Sanitization Engine** | 6-stage client-side simulation engine (safe for demos) | Go / Python local daemon invoking `nvme-cli`, `hdparm`, ATA Secure Erase |
| **Audit Hash Chain** | 32-bit FNV-1a hash chain in local storage | SHA-256 HMAC append-only ledger / Merkle tree |
| **Verification** | Interactive operator evidence review queue | Automated post-wipe sector read sampling daemon |
| **Certificate Export** | Formatted `.txt` Blob download & print view | Digitally signed cryptographic PDF (Ed25519) |
