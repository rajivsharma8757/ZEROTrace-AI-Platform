# GitHub Publishing & Repository Preparation Checklist — ZEROTrace AI

This checklist provides a secure, step-by-step procedure for preparing, committing, and safely publishing the **ZEROTrace AI** repository to GitHub.

---

## 1. Pre-Publication Security Audit

Before staging or committing any files, verify:
- [x] **No Secrets or Credentials:** Verified that no passwords, API tokens, cloud keys, or private certificates exist in the source tree.
- [x] **Gitignore Hardened:** `.gitignore` includes `node_modules/`, `dist/`, `.env`, `.env.*`, `logs/`, and editor state files.
- [x] **Environment Template Safe:** `.env.example` contains only harmless configuration placeholders.
- [x] **Code Compiles:** `npx tsc --noEmit` and `npm run build` both execute with exit code `0`.
- [x] **Technical Honesty:** All sanitization workflows are explicitly documented as `SIMULATION ONLY`.
- [x] **GitHub CLI Verified:** `gh` is installed (`v2.101.0`) and authenticated to user `rajivsharma8757`.

---

## 2. Files to Include in the Initial Commit

### Core Application Files:
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.ts`, `postcss.config.js`, `components.json`, `vercel.json`
- `index.html`
- `src/` (all components, pages, hooks, lib models, and styles)
- `public/`

### Documentation Pack:
- `README.md`
- `LICENSE` (MIT)
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`
- `.env.example`
- `.github/workflows/ci.yml`, issue templates, PR template
- `docs/` (all 16 architectural, security, SIH demo, and setup guides)

### Files That MUST Be Excluded:
- `node_modules/`
- `dist/` and `dist-ssr/`
- `.env` or any `.env.local` files
- Local temporary files, OS files (`Thumbs.db`, `.DS_Store`)

---

## 3. Recommended Repository Settings

- **Repository Name:** `ZEROTrace-AI`
- **Visibility:** **Private** (recommended initially until you are ready to make it public for SIH submission)
- **Short Description:**
  > *Secure Data Wiping and Trustworthy IT Asset Recycling Platform — Smart India Hackathon (SIH25070) Project.*
- **Suggested Topics:**
  `cybersecurity`, `data-sanitization`, `it-asset-disposition`, `e-waste`, `smart-india-hackathon`, `sih2026`, `nist-800-88`, `react`, `typescript`, `vite`, `tailwind`, `shadcn-ui`

---

## 4. Safe Local Commit Commands

Execute these commands in PowerShell inside `C:\Users\Lenovo\dyad-apps\zero-trace-ai`:

```powershell
# 1. Review status to confirm untracked files
git status

# 2. Stage all intended project and documentation files
git add .

# 3. Verify staged changes (confirm node_modules and dist are NOT staged)
git status --short

# 4. Commit changes
git commit -m "feat: complete ZEROTrace AI prototype with role portals, audit hash chain, and SIH documentation pack"
```

---

## 5. Safe GitHub Remote Creation & Push

> **IMPORTANT:** Do NOT run these commands until you explicitly decide to publish the repository.

### Option A: Using the GitHub CLI (`gh`)
Because you are already logged in to GitHub as `rajivsharma8757`, you can create a private repository and push in one command:

```powershell
# Create a PRIVATE repository on your GitHub account and push the current 'main' branch:
gh repo create ZEROTrace-AI --private --source=. --remote=origin --push
```

### Option B: Using Git CLI (Manual Repository Creation)
1. Go to [https://github.com/new](https://github.com/new) and create a repository named `ZEROTrace-AI` (choose **Private**).
2. Run in PowerShell:
   ```powershell
   git remote add origin https://github.com/rajivsharma8757/ZEROTrace-AI.git
   git branch -M main
   git push -u origin main
   ```

---

## 6. How to Make the Repository Public (When Ready for SIH Submission)

Once your project is ready for open submission or evaluation by the hackathon judges:

```powershell
# Using GitHub CLI:
gh repo edit rajivsharma8757/ZEROTrace-AI --visibility public

# Or via browser:
# Navigate to repository Settings -> General -> Danger Zone -> Change repository visibility -> Make public.
```
