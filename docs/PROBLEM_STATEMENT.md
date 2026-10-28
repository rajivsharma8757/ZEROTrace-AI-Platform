# Problem Statement & Context — ZEROTrace AI

## Smart India Hackathon (SIH) Alignment

- **Problem Statement ID:** `SIH25070`
- **Official Title:** *Secure Data Wiping for Trustworthy IT Asset Recycling*
- **Theme:** Cybersecurity / Sustainable IT
- **Problem Statement Category:** Software
- **Team Name:** ZeroTrace

---

## Background & Industry Challenges

Modern IT asset disposition (ITAD) faces two intertwined crises: **data security risk** and **unsustainable electronic waste**.

### 1. The Fallacy of "Delete" and "Format"
Most non-technical operators and smaller enterprises rely on standard operating system "Format" or partition deletion when decommissioning computers. These operations only remove file system pointer tables (e.g., MFT in NTFS or inodes in ext4), leaving 99%+ of magnetic and flash storage sectors completely intact and trivial to recover using standard forensic or free recovery software.

### 2. The SSD / NVMe Sanitization Dilemma
Unlike legacy magnetic Hard Disk Drives (HDDs) where data resides on physical addressable magnetic tracks that can be overwritten sequentially, modern Solid State Drives (SSDs) and Non-Volatile Memory Express (NVMe) storage utilize:
- **Wear Leveling:** The flash translation layer (FTL) constantly maps logical block addresses (LBAs) to changing physical flash cells to evenly distribute wear.
- **Over-Provisioned Space & Spare Blocks:** Inaccessible to standard operating system read/write calls.
- **Consequence:** Traditional multi-pass magnetic overwrite tools (such as DoD 5220.22-M 7-pass or Gutmann 35-pass) are both ineffective on SSDs and cause catastrophic premature flash degradation. Modern flash drives require firmware-level commands (**NVMe Format / Sanitize**, **ATA Secure Erase**, or **Cryptographic Erase** of hardware encryption keys).

### 3. Destruction vs. Circular Economy
Because organizations fear residual data liability under data protection statutes (such as the Digital Personal Data Protection Act (DPDPA) in India, GDPR in Europe, and HIPAA/SOX globally), they frequently mandate physical shredding of functional hardware. This destroys valuable laptops, PCs, and enterprise servers that could otherwise bridge digital divide gaps through refurbishment and reuse.

### 4. Regulatory & Global Statistics
- **UN/ITU Global E-waste Monitor (2024):** 62 million metric tonnes of e-waste generated globally in 2022. Only 22.3% was documented as properly collected and recycled.
- **E-Waste (Management) Rules, 2022 (India - MoEFCC / CPCB):** Mandates registered recyclers and refurbishers to maintain transparent, auditable disposal records and prevents unscientific dumping.

---

## Objectives of ZEROTrace AI

1. **Media-Aware Sanitization Guidance:** Provide actionable, standard-compliant sanitization recommendations matching the physical storage technology (NIST SP 800-88 Rev. 2).
2. **Chain of Custody:** Track every asset through its complete lifecycle from registration to final recycling release.
3. **Verifiable Proof:** Prevent issuance of sanitization certificates unless cryptographic or sampled verification independently validates data erasure.
4. **Public Verification:** Enable secondary buyers, refurbishers, and recycling facilities to instantly verify certificates via scannable QR / public lookup without administrative credentials.
5. **Tamper-Evident Audit Trail:** Create a chronological event ledger where every event is cryptographically hashed and linked to the prior event.
6. **Safety by Design:** Ensure browser dashboards never directly issue raw destructive disk write commands; all execution is isolated to a secure, verified local execution agent.
