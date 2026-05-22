# FinTrack – Financial Transaction Management System

FinTrack is a professional full-stack MERN (MongoDB, Express, React, Node.js) web application designed as a modern fintech asset command center. It offers real-time cash flow auditing, automated budget limits warnings, long-term savings tracking, PDF/CSV statement compilers, and rule-based AI financial insights.

---

## Technical Stack & Ports configuration
- **Frontend:** React.js, Tailwind CSS v3, Recharts, Lucide Icons, jsPDF.
  - **Local Dev Server:** `http://localhost:5173`
- **Backend:** Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, Nodemon.
  - **API Server:** `http://localhost:5050`
  - **Database Connection:** MongoDB Local Connection (`mongodb://127.0.0.1:27017/fintrack`)

---

## Key Features

1. **Secure Session Authentication:**
   - Hashed password validation (via `bcryptjs`).
   - JWT tokens stored in browser LocalStorage.
   - Protected routes logic that redirects anonymous users to sign in.
   - Role-based authorization rules (Standard User vs Administrator).

2. **Asset Ledger (Cash Flow):**
   - Record and update incomes/expenses details.
   - Set up recurring schedules (Weekly, Monthly, Yearly) that automatically append logs.
   - Real-time searching, filter sorting (by type, category, date limits), and full cursor pagination.

3. **Monthly Budget Gauges:**
   - Establish category limits.
   - Dynamic UI warning indicator turns red/orange if spending exceeds target levels.
   - Integrated notification triggers.

4. **Savings reserves targets:**
   - Define long-term saving achievements.
   - Interactive popups to deposit/withdraw funds.

5. **AI Financial Advisor:**
   - Aggregates historical cash flows to generate a customized Financial Health Score.
   - Evaluates discretionary trends and writes detailed advice.
   - **Savings Simulator:** Interactive slider tool to calculate annual surplus surpluses if discretionary categories are cut.

6. **Compiled Reports & Exports:**
   - Exporter downloads current filters as CSV tables.
   - Compiled PDF generator with formatted tables (via `jspdf` & `jspdf-autotable`).

7. **Admin Auditing console:**
   - restricted dashboard listing system aggregates.
   - Express server logger telemetry records incoming HTTP paths, status codes, response speeds, and active user emails.

---

## Directory Structure

```text
FinTrack/
├── package.json               # Root launcher scripts
├── backend/
│   ├── config/db.js           # Mongoose connector
│   ├── controllers/           # Auth, Tx, Budgets, Savings, AI, Reports, Admin
│   ├── middleware/            # JWT Guard, Admin restriction, Audit Logger
│   ├── models/                # Database schemas
│   ├── routes/                # Express endpoint mappings
│   ├── utils/                 # Token generator, AI rule systems
│   ├── .env                   # Environment keys (PORT=5050, MongoDB, JWT)
│   └── server.js              # API gateway entry point
└── frontend/
    ├── vite.config.js         # Proxy target set to port 5050
    ├── tailwind.config.js     # Custom fintech palette & glassmorphism
    ├── src/
    │   ├── components/        # ProtectedRoute, Sidebar, Navbar, MetricCard
    │   ├── context/           # AuthContext, ThemeContext (light/dark mode)
    │   ├── pages/             # Login, Register, Dashboard, Ledger, Budgets, Savings, AI, Reports, Admin
    │   ├── index.css          # Tailwind configurations & Custom glows
    │   └── main.jsx           # Mounting React app
```

---

## Quick Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Setup and Start
1. Install all dependencies from the root directory:
   ```powershell
   # Automates installing backend and frontend packages
   npm run dev
   ```
2. Navigate to `http://localhost:5173` in your browser.
3. Use the **Autofill developer shortcuts** on the login screen to register or log in instantly.
4. Click **Seed Demo Environment** on the Dashboard homepage to populate active transactional data.
