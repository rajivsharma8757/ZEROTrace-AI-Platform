# Smart India Hackathon (SIH) Live Demo Guide — ZEROTrace AI

**Problem Statement:** `SIH25070` — *Secure Data Wiping for Trustworthy IT Asset Recycling*  
**Theme:** Cybersecurity / Sustainable IT | **Category:** Software | **Team:** ZeroTrace

---

## 1. 30-Second Elevator Pitch

> *"Respected evaluators, every year millions of decommissioned computers are shredded out of fear of data leakage, or dumped into informal e-waste streams with unformatted drives containing confidential data. ZEROTrace AI replaces guesswork with a verifiable, media-aware trust loop: we analyze hardware according to NIST 800-88 guidelines, simulate and orchestrate controlled sanitization, verify evidence before certification, and issue tamper-evident digital certificates with public QR verification. We prove that a device is clean before a single byte of e-waste is recycled or reused."*

---

## 2. 2 to 3-Minute Live Demo Script & Sequence

### Timing Overview
- **0:00 – 0:30:** Problem, Login & Portals (Admin vs. Operator vs. Customer)
- **0:30 – 1:00:** Device Intake & Media-Aware AI Recommendation
- **1:00 – 1:40:** Sanitization Simulation & Verification Gate
- **1:40 – 2:15:** Digital Certificate, QR Visual & Public Verification Lookup
- **2:15 – 2:45:** Tamper-Evident Hash Chain Audit Trail & Recycling Release
- **2:45 – 3:00:** Conclusion, Circular IT Impact & Future Roadmap

---

### Step-by-Step Screen Walkthrough

#### Step 1: Login Portal (`/login`)
- **Action:** Open `http://localhost:8080/login`.
- **Narration:** *"We provide a unified, role-aware portal for Administrators, Operators, and Customers. Notice the explicit isolation: Customers can never see internal admin queues or other tenants' hardware."*
- **Click:** Select **Employee / Operator** (`operator@zerotrace.demo`) and click **Enter demo workspace**.

#### Step 2: Device Intake & AI Recommendation (`/devices`)
- **Action:** Navigate to **Devices**.
- **Demonstrate:**
  1. Click on `APX-LT-1042` (NVMe 512GB). Point out the **AI Recommendation**: NIST 800-88 Purge (*Cryptographic Erase*), 94% confidence, ~8 min.
  2. Click on `APX-SRV-006` (HDD 4096GB). Point out how the recommendation changes to multi-pass overwrite with a higher duration estimate.
  3. Click **Register device** to show the intake modal for new incoming assets.
- **Key Talking Point:** *"Sanitization must be media-aware. Multi-pass overwriting is designed for magnetic HDDs but degrades flash drives; SSDs and NVMe require cryptographic erase or firmware-level purge commands."*

#### Step 3: Simulated Wipe Execution (`/wipe-jobs`)
- **Action:** Navigate to **Wipe jobs**.
- **Demonstrate:**
  1. Highlight the safety warning banner: *"Simulation only: progress and evidence are locally generated for prototype demonstration."*
  2. Locate an eligible device or active wipe (e.g. `APX-DT-2088`).
  3. Click **Advance simulation** through the phases (Detecting Storage -> Preparing Sanitization -> Sanitizing -> Finalizing).
  4. At 100%, show how the device automatically enters `VERIFICATION_PENDING`.
- **Key Talking Point:** *"By design, our web dashboard never runs raw destructive disk writes directly. In production, this orchestrates a local agent daemon."*

#### Step 4: Verification Queue (`/verification`)
- **Action:** Navigate to **Verification**.
- **Demonstrate:**
  1. Point out the pending record with simulated evidence (sampled reads across 24 sectors and cryptographic key disposition).
  2. Click **Pass**. Device status immediately transitions to `VERIFIED`.
- **Key Talking Point:** *"This is our critical gatekeeper: certification is mathematically blocked until verification is recorded as PASS."*

#### Step 5: Certificate Generation & Public QR Lookup (`/certificates` & `/verify/:id`)
- **Action:** Sign out, log in as **Administrator** (`admin@zerotrace.demo`), navigate to **Certificates**.
- **Demonstrate:**
  1. Click **Issue Certificate** under the eligible banner.
  2. Point out the unique Certificate ID (e.g. `ZT-2026-XXXXXX`), cryptographic hash (`ZT-xxxxxxxx`), and QR visual.
  3. Click **Download** to show the exported certificate metadata.
  4. Now open an Incognito tab (or sign out) and navigate to `/verify/ZT-2026-8F1A92`.
  5. Show how any third party, secondary buyer, or recycler can publicly verify the certificate without logging in.

#### Step 6: Audit Trail & Recycling Approval (`/audit-log` & `/recycling`)
- **Action:** Log back in as **Admin**.
- **Demonstrate:**
  1. Open **Audit trail** (`/audit-log`): Show how every single action has been chained: `previousHash -> currentHash`.
  2. Open **Recycling** (`/recycling`): Show that only verified and certified devices are eligible for release. Click **Approve**.

---

## 3. How to Answer Tough Judge Questions

### Q1: "Does this web app actually wipe my hard drive right now?"
> **Honest Answer:**  
> *"No, sir/ma'am, and deliberately so. A web browser running in a sandbox should never possess raw physical device block-level write capabilities—that would be an extreme security vulnerability. Today's system demonstrates the complete Control Plane, decision algorithms, and evidence verification. In Phase 2 of our architecture, hardware execution is performed by a dedicated local agent daemon running `nvme-cli` and `hdparm` with kernel privileges."*

### Q2: "Is your AI an actual machine learning model or rule-based?"
> **Honest Answer:**  
> *"In this prototype, it is a deterministic, media-aware heuristic engine adhering to NIST SP 800-88 Rev. 2 standards. It evaluates storage interface (NVMe, SSD, HDD), capacity, and encryption status. For production, we plan to train a model on enterprise hardware disposition logs to optimize sanitization durations and predict drive failure risks."*

### Q3: "Can someone forge the certificate or audit log?"
> **Honest Answer:**  
> *"In this prototype, the audit chain is computed using an FNV-1a hash chain in browser storage to demonstrate the data structure. For production, certificates will be signed with asymmetric Ed25519 digital signatures, and the audit log will be committed to an immutable append-only ledger or Merkle tree so that any alteration immediately breaks verification."*

---

## 4. Demo Reset Instructions

To return the entire demo to a pristine, predictable state right before the judges walk up:
1. Log in as **Administrator** (`admin@zerotrace.demo`).
2. Click **Settings** in the sidebar.
3. Click the red button: **Reset demo data**.
4. You will be signed out, all temporary test records are cleared, and the default enterprise assets will be reloaded.
