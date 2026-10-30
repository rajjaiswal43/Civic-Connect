# CIVIC CONNECT
### AI-Powered Civic Complaint Intelligence & Resolution Platform

> **From citizen-reported public infrastructure issues to verified, accountable resolution.**  
> *Developed by: Raj Jaiswal, Sahitya Katiyar, Ram Kumar Gupta, Yash Kumar Singh, Vandit Jain*  
> *Department of Computer Science & Engineering, Galgotias College of Engineering and Technology*

---

## 🏛️ Project Overview
Civic Connect is an AI-assisted civic complaint intelligence platform bridging citizens, municipal authorities (GNIDA), and field maintenance crews. It replaces fragmented, unaccountable grievance redressal with a verifiable, duplicate-aware, location-intelligent workflow.

### 🌟 Key Innovations
1. **Explainable AI Priority (6-Factor Formula)**:
   $$\text{Priority Score} = \text{Severity (30\%)} + \text{Public Impact (20\%)} + \text{Vulnerability (15\%)} + \text{Corroboration (15\%)} + \text{Persistence (10\%)} + \text{Location (10\%)}$$
2. **Proximity Duplicate Clustering**: Real Haversine spatial distance scans (<150m) and text similarity clustering prevent duplicate work orders.
3. **Accountable Municipal Officer Hub**: Configurable officer credentials, jurisdictional triage, official SLA deadline commitment, and tamper-evident audit logging.
4. **Before/After Evidence Slider**: Interactive side-by-side photographic comparison with GPS and timestamp provenance.
5. **Two-Way Citizen Closure Gate**: Tasks cannot be closed arbitrarily; citizens verify repair on-site or reopen disputes with reason codes.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
python3 -m pip install -r backend/requirements.txt
```

### 2. Run Applications
You can run both concurrently or in separate terminals:

#### Run Both (Recommended):
```bash
npm run dev:all
```

#### Run Separately:
**Terminal 1 (Backend - FastAPI):**
```bash
npm run backend
# Running at: http://localhost:8000
# Interactive Swagger Documentation: http://localhost:8000/docs
```

**Terminal 2 (Frontend - React + Vite):**
```bash
npm run dev
# Running at: http://localhost:5173
```

---

## 📋 System Architecture & REST APIs (Chapter 8)
Civic Connect implements full end-to-end REST endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/otp` | Citizen & Officer identity verification |
| `GET` | `/api/admin/officer` | Retrieve active Municipal Officer credentials |
| `PUT` | `/api/admin/officer` | Update Officer profile (Name, Badge, Zone, Contact) |
| `GET` | `/api/incidents` | List public incidents with filters (category, ward, priority) |
| `GET` | `/api/incidents/{id}` | Read incident details, before/after media & audit logs |
| `POST` | `/api/incidents` | Submit new report with AI classification & duplicate detection |
| `POST` | `/api/incidents/{id}/validate` | Citizen corroboration & 1-5 impact rating |
| `POST` | `/api/admin/incidents/{id}/acknowledge` | Official municipal acknowledgement & target SLA |
| `POST` | `/api/admin/incidents/{id}/assign` | Dispatch work order to field technician squad |
| `POST` | `/api/admin/incidents/{id}/override` | Officer manual override with audit trail justification |
| `PATCH` | `/api/worker/incidents/{id}/status` | Field technician status check-in (IN_PROGRESS) |
| `POST` | `/api/worker/incidents/{id}/completion` | Upload after-repair proof, materials & technician notes |
| `POST` | `/api/incidents/{id}/closure-feedback` | Citizen final sign-off (confirm resolved vs dispute) |
| `POST` | `/api/admin/incidents/{id}/reopen` | Reopen disputed incident with critical escalation |
| `GET` | `/api/analytics/hotspots` | Recurring geographic failure hotspot summaries |
| `GET` | `/api/analytics/summary` | Citywide KPI analytics and resolution trends |

---

## 🧪 Demonstration Script (Appendix B)
1. **Citizen Portal (`/` - Role: Citizen)**:
   - Click **"Report Issue"** or use camera capture.
   - Enter details and witness real-time AI classification & duplicate candidate clustering.
2. **Municipal Officer Hub (Role: Municipal Officer)**:
   - View your **Officer Credentials Badge** (Er. R. B. Chauhan, GNIDA Zone 1).
   - Click **"Edit Officer Details"** to customize badge, name, designation, or contact hotline.
   - Acknowledge the incident and dispatch field technician squad with official SLA deadline.
3. **Field Technician App (Role: Field Worker)**:
   - Check in on site, capture After-Repair photographic proof, and log materials used.
4. **Citizen Accountability Gate**:
   - Inspect before/after slider on the citizen portal and confirm closure or dispute/reopen.
5. **Interactive API & Relational Schema**:
   - Click **"API & DB"** in the top navbar to execute live REST requests directly against FastAPI!

