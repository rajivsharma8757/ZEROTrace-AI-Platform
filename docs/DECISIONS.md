# Architecture Decision Records (ADRs) — ZEROTrace AI

This document logs significant architectural and engineering decisions made during the development of ZEROTrace AI.

---

## ADR-001: Separation of Web Control Plane from Physical Execution Plane

### Status
Accepted

### Context
In designing an IT asset sanitization platform, an initial consideration was whether a web application could directly command local hardware sanitization (e.g., via WebUSB, WebSerial, or native browser extensions).

### Decision
We explicitly decided to separate the platform into a **Web Control Plane** (orchestration, custody, verification, certificates, audit) and an isolated **Local Execution Plane** (agent daemon).

### Consequences
- **Positive:** Maximum security. Browser sandboxes are never granted destructive raw storage access. Web applications can be deployed in the cloud without root privileges.
- **Negative:** Requires deploying an auxiliary agent or running in simulation mode during pure web demonstrations.

---

## ADR-002: Client-Side Simulation Mode for Hackathon Demonstration

### Status
Accepted

### Context
Demonstrating real disk wiping during an in-person Smart India Hackathon presentation carries extreme risks:
1. Risk of accidentally overwriting the demonstrator's operating system or presentation slides.
2. A single wipe operation can take from 20 minutes to several hours, making a 3-minute live pitch impossible.

### Decision
Implement a clearly labeled, multi-phase **Simulation Mode** directly in the web application for prototype demonstration.

### Consequences
- **Positive:** Safe, deterministic, rapid 6-phase demonstrations that allow evaluators to inspect all state transitions and edge cases within 2 minutes.
- **Negative:** Must be clearly labeled as `SIMULATION ONLY` across all screens to ensure complete technical honesty and prevent false capability claims.

---

## ADR-003: Modern React 19, TypeScript, Vite & shadcn/ui Stack

### Status
Accepted

### Context
The application requires a dark, high-contrast, professional cybersecurity interface with rapid compilation, high accessibility, and rock-solid type safety.

### Decision
Adopt React 19 with TypeScript 5, Vite 8 bundler, Tailwind CSS v3, and the [shadcn/ui](https://ui.shadcn.com/) component library built on Radix UI primitives.

### Consequences
- **Positive:** Lightning-fast HMR (<100ms), complete TypeScript static typing across all domain models, enterprise design aesthetic, accessible ARIA primitives out of the box.
- **Negative:** Requires maintaining shadcn component source files locally within `src/components/ui/`.

---

## ADR-004: Media-Aware Heuristics Following NIST SP 800-88 Rev. 2

### Status
Accepted

### Context
Traditional wiping software applies legacy DoD 5220.22-M 3-pass or 7-pass magnetic overwrite indiscriminately across all drives, which damages solid-state storage and fails to reach wear-leveled flash blocks.

### Decision
Implement media-aware decision heuristics based on **NIST Special Publication 800-88 Rev. 2** (*Guidelines for Media Sanitization*):
- NVMe / SSD with encryption: Cryptographic Erase (Purge).
- Non-encrypted SSD: Firmware Block Erase / Sanitize (Purge).
- Magnetic HDD: Multi-pass overwrite (Clear / Purge).

### Consequences
- **Positive:** Scientifically grounded, compliant with modern storage standards, prevents unnecessary SSD wear.
- **Negative:** Requires accurate drive capability reporting during intake.

---

## ADR-005: Gating Certification and Recycling Behind Mandatory Verification

### Status
Accepted

### Context
Many disposition systems issue certificates immediately upon wipe completion without verifying whether the sectors actually contain residual data or whether cryptographic keys were shredded.

### Decision
Enforce a hard state machine transition:
`WIPING -> VERIFICATION_PENDING -> (Pass/Fail) -> VERIFIED -> CERTIFIED -> READY_FOR_RECYCLING`.
A certificate cannot be generated, and recycling release cannot be approved, unless verification is explicitly confirmed.

### Consequences
- **Positive:** Eliminates false-positive certification. Ensures downstream recyclers receive hardware with verified proof.
- **Negative:** Adds a mandatory operational step for operators.
