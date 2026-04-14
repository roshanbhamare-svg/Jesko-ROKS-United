# 🚗 Jesko — AI-Powered Car Rental & Driver Marketplace

**Earn from idle cars 💰 | Jobs for drivers 🚗 | Affordable mobility 🌍**

Jesko is an AI-powered 3-sided mobility marketplace connecting car owners, drivers, and users.

Developed by **ROKS UNITED** (Roshan Bhamare, Om Patil, Kaustubh Desale, Satvik Kekane).

---

## 🏗 System Architecture

The project consists of a FastAPI backend (with SQLite for local development) and a React (Vite) + TailwindCSS frontend.

```text
Jesko-ROKS-United/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── ml/               # AI & ML Logic (Recommendations, Scoring)
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── routers/          # API Endpoints (Auth, Cars, Bookings, Chat)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── database.py       # Async SQLite configuration
│   │   └── main.py           # FastAPI entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # Vite + React Frontend
    ├── src/
    │   ├── components/       # Reusable components (Cards, Chatbot, Navbar)
    │   ├── context/          # Context API (Auth Context)
    │   ├── pages/            # View pages (Dashboards, Booking, Landing)
    │   ├── services/         # Axios API Client Wrapper
    │   ├── App.jsx           # Routing Setup
    │   └── main.jsx          # React Entry
    ├── package.json
    └── tailwind.config.js
```

---

## 🔗 API Endpoints

**Auth**
- `POST /api/auth/register` — Register User/Owner/Driver
- `POST /api/auth/login` — Get JWT Token
- `GET /api/auth/me` — Current user profile

**Cars / Bookings**
- `GET /api/cars` — Browse available cars
- `GET /api/cars/my` — (Owner) List owned cars
- `POST /api/bookings` — Request a booking
- `PATCH /api/bookings/{id}/status` — Accept/Start/Complete trip

**Drivers / AI**
- `GET /api/drivers` — Marketplace of verified drivers
- `POST /api/chat` — Gemini AI Assistant
- `POST /api/ai/recommendations` — AI Content-based filtering for cars
- `GET /api/ai/driver-score/{id}` — Compute trust score for drivers

---

## ▶️ How to Run Locally

### 1. Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd Jesko-ROKS-United/backend
   ```
2. Create and activate a Virtual Environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Setup Environment Variables:
   Copy `.env.example` to `.env` and add your Gemini API Key if you want real AI chat:
   ```bash
   cp .env.example .env
   ```
5. Run the Server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will be available at `http://127.0.0.1:8000` Let FastAPI run in the background. It will create `jesko.db` automatically.*

### 2. Frontend (React)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd Jesko-ROKS-United/frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

---

> **Note**: A Mock admin feature exists. An admin user must be set manually into the database, or an existing user can be changed via SQLite DB Browser.

🚀 **The Application is now fully Functional!**
