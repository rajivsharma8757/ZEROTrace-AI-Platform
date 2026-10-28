# Solution Architecture — ZEROTrace AI

## System Architectural Planes

ZEROTrace AI separates its architectural responsibilities across three distinct operational planes:

```mermaid
graph TD
    subgraph Control Plane ["1. Control Plane (Governance & Orchestration)"]
        UI["Web Dashboard (React 19 / TypeScript)"]
        RBAC["Role-Based Access Control (Admin, Operator, Customer)"]
        DB[("State Persistence (localStorage / Future PostgreSQL)")]
        UI --> RBAC --> DB
    end

    subgraph Execution Plane ["2. Execution Plane (Sanitization Engine)"]
        Sim["Simulation Engine (Current Prototype)"]
        Agent["Local OS Sanitization Agent (Future Phase 2)"]
        Storage["Target Storage Device (NVMe / SSD / HDD)"]
        Sim -.->|Safe Simulated Phases| UI
        Agent -->|NIST 800-88 Purge/Clear| Storage
    end

    subgraph Evidence Plane ["3. Evidence Plane (Verification & Proof)"]
        VerQueue["Evidence Review & Sampling Queue"]
        CertEngine["Certificate Generation & Hash Chain"]
        PublicEndpoint["Public QR Verification Portal (/verify/:id)"]
        VerQueue --> CertEngine --> PublicEndpoint
    end

    Control Plane <--> Execution Plane
    Execution Plane --> Evidence Plane
```

---

## Current Architecture vs. Proposed Future Architecture

### Current Implemented Architecture (Phase 1 Prototype)

The current implementation is an interactive, browser-based prototype. All storage and state management operate client-side in the browser:

```mermaid
graph LR
    subgraph Client Browser
        User(["Operator / Admin / Customer"])
        Router["React Router v6"]
        Components["shadcn/ui + Tailwind Components"]
        Hooks["useAppData() Hook + AuthContext"]
        StorageEngine[("Browser localStorage<br/>'zerotrace-ai-prototype-v1'")]
        SimEngine["Simulated Wipe Phase Machine<br/>(0% -> 100%)"]
        HashEngine["FNV-1a Hash Chain Calculator<br/>'ZT-xxxxxxxx'"]
        
        User --> Router
        Router --> Components
        Components --> Hooks
        Hooks <--> StorageEngine
        Hooks <--> SimEngine
        Hooks <--> HashEngine
    end
```

### Proposed Future Production Architecture (Phase 2 & 3 Target)

```mermaid
graph TB
    subgraph Frontend ["Client Tier"]
        AdminBrowser["Admin & Operator Dashboard"]
        CustomerPortal["Customer Asset Portal"]
        PublicVerifier["Public QR Verification App"]
    end

    subgraph Backend ["Server Tier (Node.js / Express API)"]
        APIGateway["REST API Gateway + Rate Limiting"]
        AuthService["Auth Service (JWT / Argon2 / RBAC)"]
        AssetService["Asset & Job Management Service"]
        CertService["Certificate & Cryptographic Ledger Service"]
        AuditService["Audit Trail & Merkle Tree Service"]
    end

    subgraph DatabaseTier ["Persistence Tier"]
        Postgres[("PostgreSQL Database (Prisma ORM)")]
        RedisCache[("Redis Session & Job Cache")]
    end

    subgraph HardwareTier ["Execution Tier (Secure Local Agent)"]
        LocalAgent["Local Agent Daemon (Go / Python / Rust)"]
        StorageDrivers["Storage Subsystem (nvme-cli / hdparm / ATA)"]
        LocalAgent --> StorageDrivers
    end

    Frontend -->|HTTPS / WSS| APIGateway
    APIGateway --> AuthService
    APIGateway --> AssetService
    APIGateway --> CertService
    APIGateway --> AuditService
    
    AuthService & AssetService & CertService & AuditService --> Postgres
    AssetService <--> RedisCache
    
    LocalAgent <-->|Mutual TLS / Signed Job Tokens| APIGateway
```

---

## Device Sanitization Lifecycle State Machine

An asset moves through a strict linear lifecycle where certification and recycling are unreachable without passing verification:

```mermaid
stateDiagram-v2
    [*] --> REGISTERED: Asset Intake & Details
    REGISTERED --> WIPE_PENDING: Operator Schedules Sanitization
    WIPE_PENDING --> WIPING: Operator Confirms & Starts
    
    state WIPING {
        [*] --> Initializing
        Initializing --> DetectingStorage
        DetectingStorage --> PreparingSanitization
        PreparingSanitization --> Sanitizing
        Sanitizing --> Finalizing
        Finalizing --> [*]
    }
    
    WIPING --> VERIFICATION_PENDING: Progress Reaches 100%
    VERIFICATION_PENDING --> VERIFIED: Operator Approves Sampled Evidence
    VERIFICATION_PENDING --> FAILED: Sector Read or Key Check Fails
    FAILED --> WIPE_PENDING: Remediation / Retry
    
    VERIFIED --> CERTIFIED: Admin / System Issues Certificate
    CERTIFIED --> READY_FOR_RECYCLING: Authorized Downstream Approval
    READY_FOR_RECYCLING --> RECYCLED: Physical Disposition Complete
    RECYCLED --> [*]
```

---

## Verification-to-Certificate & Recycling Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Op as Operator (Employee)
    participant UI as Dashboard UI
    participant Data as App State (localStorage)
    actor Admin as Administrator
    actor Cust as Customer / Auditor
    
    Op->>UI: Selects asset & clicks "Start demo wipe"
    UI->>Data: Updates device status to WIPING
    Op->>UI: Advances simulation phases (0% to 100%)
    UI->>Data: Status becomes VERIFICATION_PENDING; creates verification record
    Op->>UI: Reviews simulated sector read evidence & clicks "Pass"
    UI->>Data: Status becomes VERIFIED; logs audit event
    Admin->>UI: Navigates to Certificates & clicks "Issue Certificate"
    UI->>Data: Generates unique Certificate ID + Hash; status becomes CERTIFIED
    Cust->>UI: Scans QR / opens /verify/:certId
    UI-->>Cust: Displays valid certificate proof & device specs without login
    Admin->>UI: Navigates to Recycling & clicks "Approve for Recycling"
    UI->>Data: Records recycling approval; status becomes READY_FOR_RECYCLING
```
