"""
Jesko — FastAPI Application Entry Point
Registers all routers, configures CORS, and initialises the database on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db

# ─── Routers ─────────────────────────────────────────────────────────────────
from app.routers import auth, cars, drivers, bookings, payments, reviews, chatbot, ai, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB tables on startup."""
    await init_db()
    print(f"✅ Jesko API started — {settings.environment} mode")
    yield
    print("🛑 Jesko API shutting down")


app = FastAPI(
    title="Jesko API",
    description="AI-Powered Car Rental & Driver Marketplace — ROKS United",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(drivers.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(chatbot.router)
app.include_router(ai.router)
app.include_router(admin.router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "🚗 Jesko API is running",
        "version": "1.0.0",
        "team": "ROKS United",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "environment": settings.environment}
