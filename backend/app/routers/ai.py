"""
Jesko — AI/ML Router
Recommendation engine, demand prediction, driver scoring, damage detection.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import random
from app.database import get_db
from app.models.models import Car, Driver, Booking
from app.schemas.schemas import (
    CarOut, DriverOut, RecommendationRequest,
    DemandPredictionRequest, DemandPredictionResponse
)
from app.middleware.auth import get_current_user
from app.models.models import User
from app.ml.recommendation import recommend_cars
from app.ml.demand import predict_demand
from app.ml.driver_score import compute_driver_score

router = APIRouter(prefix="/api/ai", tags=["AI/ML"])


@router.post("/recommendations", response_model=List[CarOut])
async def get_recommendations(
    payload: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI-powered car recommendations based on user preferences & history."""
    # Fetch user's booking history
    b_result = await db.execute(select(Booking).where(Booking.user_id == current_user.id))
    bookings = b_result.scalars().all()

    # Fetch available cars
    query = select(Car).where(Car.is_available == True)
    if payload.location:
        query = query.where(Car.location.ilike(f"%{payload.location}%"))
    if payload.max_price:
        query = query.where(Car.price_per_day <= payload.max_price)
    if payload.category:
        query = query.where(Car.category == payload.category)

    c_result = await db.execute(query)
    cars = c_result.scalars().all()

    # Run ML recommendation
    recommended = recommend_cars(cars, bookings, limit=payload.limit)
    return [CarOut.model_validate(c) for c in recommended]


@router.post("/demand", response_model=DemandPredictionResponse)
async def demand_prediction(
    payload: DemandPredictionRequest,
    current_user: User = Depends(get_current_user),
):
    """Predict rental demand for a given location and date."""
    result = predict_demand(payload.location, payload.date)
    return DemandPredictionResponse(**result)


@router.get("/driver-score/{driver_id}")
async def get_driver_score(
    driver_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compute AI driver trust score."""
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        return {"error": "Driver not found"}

    score = compute_driver_score(
        rating=driver.rating,
        acceptance_rate=driver.acceptance_rate,
        cancellation_rate=driver.cancellation_rate,
        total_trips=driver.total_trips,
    )
    # Persist updated score
    driver.driver_score = score
    await db.commit()
    return {
        "driver_id": driver_id,
        "driver_score": score,
        "rating": driver.rating,
        "acceptance_rate": driver.acceptance_rate,
        "cancellation_rate": driver.cancellation_rate,
        "total_trips": driver.total_trips,
        "grade": "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 50 else "D",
    }


@router.post("/damage-detection")
async def damage_detection(
    current_user: User = Depends(get_current_user),
):
    """
    Mock car damage detection endpoint.
    In production: integrate a TensorFlow/PyTorch CV model here.
    Simulates a result with confidence scores.
    """
    damage_types = ["No Damage", "Minor Scratch", "Dent", "Broken Glass", "Major Damage"]
    weights = [0.60, 0.20, 0.10, 0.07, 0.03]
    detected = random.choices(damage_types, weights=weights, k=1)[0]
    confidence = round(random.uniform(0.82, 0.99), 3)

    return {
        "status": "analysed",
        "damage_detected": detected != "No Damage",
        "damage_type": detected,
        "confidence": confidence,
        "recommendation": (
            "Car is safe to rent." if detected == "No Damage"
            else f"Damage found: {detected}. Please resolve before listing."
        ),
        "model": "JeskoDamageNet-v1 (mock)",
    }
