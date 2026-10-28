# Screenshots & Visual Assets Guide — ZEROTrace AI

This guide specifies the capture plan, naming conventions, and recommended resolutions for visual assets to document the ZEROTrace AI platform for GitHub and SIH submissions.

---

## 1. Directory Structure

Store captured PNG images in the `docs/screenshots/` directory:

```
docs/screenshots/
├── 01_login_portal.png
├── 02_admin_dashboard.png
├── 03_operator_workspace.png
├── 04_device_inventory.png
├── 05_ai_sanitization_recommendation.png
├── 06_simulated_wipe_progress.png
├── 07_verification_queue.png
├── 08_digital_certificate_view.png
├── 09_public_qr_verification.png
├── 10_tamper_evident_audit_trail.png
└── 11_recycling_approval_gate.png
```

---

## 2. Capture Specifications

| Asset Name | Target Route | Persona / Role | What to Highlight |
| :--- | :--- | :--- | :--- |
| `01_login_portal.png` | `/login` | Public | Multi-role demo selector cards (Admin, Operator, Customer). |
| `02_admin_dashboard.png` | `/admin-dashboard` | Admin | Total devices metric cards, active wipe jobs, status distribution. |
| `03_operator_workspace.png` | `/employee-dashboard` | Employee | Assigned hardware count, pending wipe queue, active wipes. |
| `04_device_inventory.png` | `/devices` | Admin / Operator | Tabular asset list with NVMe, SSD, and HDD tags and health status. |
| `05_ai_sanitization_recommendation.png` | `/devices` | Admin / Operator | Device inspection sidebar with NIST 800-88 recommendation and confidence score. |
| `06_simulated_wipe_progress.png` | `/wipe-jobs` | Operator | Active wipe progress bar (e.g. 58%), 6-phase status, safety simulation banner. |
| `07_verification_queue.png` | `/verification` | Operator | Sampled evidence review card with Pass / Fail action buttons. |
| `08_digital_certificate_view.png` | `/certificates` | Admin / Customer | Certificate card showing unique ID, hash, QR visual, Download, and Print buttons. |
| `09_public_qr_verification.png` | `/verify/:id` | Public | Standalone public verification page showing the green valid certificate seal. |
| `10_tamper_evident_audit_trail.png` | `/audit-log` | Admin | Event log table showing `previousHash` -> `currentHash` chaining. |
| `11_recycling_approval_gate.png` | `/recycling` | Admin | Assets awaiting recycling release and certified downstream approval history. |

---

## 3. Recommended Capture Instructions

1. Start the local development server:
   ```powershell
   npm run dev
   ```
2. Open Google Chrome or Microsoft Edge at `http://localhost:8080`.
3. Set your browser window to a clean 16:9 ratio (recommended: **1920x1080** or **1440x900** at 100% display scale).
4. Use standard screenshot shortcuts:
   - **Windows:** `Win + Shift + S` or the Windows Snipping Tool.
   - Or Chrome DevTools: Press `Ctrl + Shift + P` -> type *"Capture full size screenshot"*.
5. Save files under `docs/screenshots/` matching the exact filenames listed above.
