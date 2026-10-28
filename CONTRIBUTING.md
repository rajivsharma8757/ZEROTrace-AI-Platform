# Contributing to ZEROTrace AI

Thank you for your interest in contributing to **ZEROTrace AI — Secure Data Wiping and Trustworthy IT Asset Recycling Platform**!

ZEROTrace AI was conceived as an open, verifiable solution for end-of-life IT asset sanitization, verification, and circular recycling governance (developed in context of Smart India Hackathon problem statement **SIH25070**).

---

## Code of Conduct

We expect all contributors to adhere to standard professional open-source standards:
- Treat all team members and contributors with respect.
- Provide constructive, actionable feedback in reviews and issues.
- Maintain technical honesty: never misrepresent prototype simulation logic as production hardware drivers or real physical disk erasure.

---

## Development Setup

1. **Prerequisites:**
   - Node.js `v18.0.0` or higher (verified with Node `v24.x`).
   - `npm` `v9.0.0` or higher (or `pnpm`).
   - Git.

2. **Clone & Install:**
   ```bash
   git clone https://github.com/rajivsharma8757/ZEROTrace-AI.git
   cd ZEROTrace-AI
   npm install
   ```

3. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:8080`.

4. **Verify TypeScript & Code Quality:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## Contribution Workflow

1. **Fork or Branch:**
   Create a descriptive branch for your work:
   ```bash
   git checkout -b feature/real-qr-generator
   # or
   git checkout -b fix/mobile-nav-contrast
   ```

2. **Guidelines for Code Changes:**
   - **Frontend UI:** Use existing Tailwind CSS and shadcn/ui component patterns.
   - **Technical Honesty:** If adding simulated features, clearly mark them as `DEMO / SIMULATED` in the UI.
   - **Security:** Do not commit credentials, API keys, or `.env` files.
   - **Testing:** Ensure `npx tsc --noEmit` and `npm run build` succeed before opening a Pull Request.

3. **Commit Messages:**
   Follow conventional commits:
   - `feat: add client-side PDF export for sanitization certificates`
   - `fix: resolve responsive table overflow in device inventory`
   - `docs: update system architecture diagram in docs/`

4. **Submit a Pull Request:**
   - Fill out the PR template completely.
   - Link any relevant issues.
   - Include screenshots or recordings of UI changes where applicable.

---

## Priority Contribution Areas

- [ ] Transitioning pseudo-QR matrix into scannable standard ISO/IEC 18004 QR codes (`qrcode.react`).
- [ ] Client-side PDF export using standard libraries (`jspdf`, `html2canvas`).
- [ ] Dedicated UI views for `/reports` and `/notifications`.
- [ ] Node.js / Express backend service layer with PostgreSQL and Prisma schema integration.
- [ ] Cross-platform local disk agent daemon (Python/Go/C++) interfacing with NVMe/ATA sanitization utilities (`nvme-cli`, `hdparm`).
