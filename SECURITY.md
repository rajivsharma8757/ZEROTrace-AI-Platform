# Security Policy — ZEROTrace AI

## Scope and Current Architecture

**ZEROTrace AI** is currently implemented as an interactive, client-side prototype designed for demonstration, workflow validation, and hackathon evaluation (Smart India Hackathon Problem Statement **SIH25070**).

### Important Security Notice & Threat Model Reality

1. **Client-Side Simulation Boundary:**
   - The current web application **does not directly execute low-level hardware or destructive disk sanitization commands**.
   - Sanitization progress, sector read evidence, and state transitions are generated in-memory to safely demonstrate the proposed operational lifecycle without endangering host storage.

2. **Authentication and Authorization:**
   - Active authentication relies on local session tracking via browser `localStorage` (`"zerotrace-user"`).
   - Role-based access control (RBAC) is enforced client-side via React Router guards. In a production deployment, this must be backed by secure HTTP-only session cookies or signed JWTs verified by an authoritative backend API.

3. **Audit Trail & Hash Integrity:**
   - The current prototype records audit events using a client-side FNV-1a hash chain (`ZT-xxxxxxxx`).
   - While this demonstrates the mathematical concept of an event ledger (`previousHash` -> `currentHash`), it is **not a cryptographically secure hash (such as SHA-256 or BLAKE3)**, nor is it immutable against local browser manipulation. Production versions will incorporate server-side SHA-256 HMAC or append-only distributed ledgers.

4. **Secrets & Credentials:**
   - No production secrets, API tokens, or private certificates are embedded in this repository.
   - All demo users (`admin@zerotrace.demo`, `operator@zerotrace.demo`, `customer@zerotrace.demo`) are non-privileged local mock personas.

---

## Supported Versions

| Version | Status | Security Support |
| :--- | :--- | :--- |
| `0.1.0-prototype` (Current) | Active Prototype | Vulnerability reporting & documentation |
| `< 0.1.0` | Deprecated | None |

---

## Reporting a Vulnerability

If you identify a security issue, vulnerability, or accidental secret exposure:

1. **Do not open a public GitHub issue.**
2. Send a detailed report via email to the project maintainers (or open a private GitHub security advisory via the **Security** tab once hosted on GitHub).
3. Include:
   - Nature of the issue (e.g., dependency vulnerability, XSS vector, state manipulation flaw).
   - Step-by-step reproduction steps.
   - Potential impact assessment.
4. Maintainers will acknowledge your report within 48 hours and work on remediation before public disclosure.

---

## Production Security Roadmap

For production deployment, ZEROTrace AI is designed around three separated planes:
1. **Control Plane:** Hardened Node.js/Express API with strict CORS, rate-limiting, CSP headers, and PostgreSQL persistence with row-level security.
2. **Execution Plane:** Authenticated local agent communicating via mutual TLS (mTLS) with cryptographically validated task tokens.
3. **Evidence Plane:** Asymmetric Ed25519 digital signatures on all generated sanitization certificates, verifiable publicly against a central public key registry.
