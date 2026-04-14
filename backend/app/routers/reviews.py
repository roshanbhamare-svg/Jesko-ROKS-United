"""
Jesko — Reviews Router
Post-trip ratings for cars and drivers.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.database import get_db
from app.models.models import Review, Booking, Car, Driver, BookingStatus, User
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewOut, status_code=201)
async def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User submits a review after a completed booking."""
    # Validate booking
    b_result = await db.execute(select(Booking).where(Booking.id == payload.booking_id))
    booking = b_result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    # Check for duplicate review
    r_result = await db.execute(select(Review).where(Review.booking_id == payload.booking_id))
    if r_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Review already submitted")

    review = Review(
        booking_id=payload.booking_id,
        reviewer_id=current_user.id,
        car_id=booking.car_id,
        driver_id=booking.driver_id,
        car_rating=payload.car_rating,
        driver_rating=payload.driver_rating,
        comment=payload.comment,
    )
    db.add(review)

    # Update car average rating
    if payload.car_rating:
        car_result = await db.execute(select(Car).where(Car.id == booking.car_id))
        car = car_result.scalar_one_or_none()
        if car:
            avg_result = await db.execute(
                select(func.avg(Review.car_rating)).where(Review.car_id == booking.car_id)
            )
            avg = avg_result.scalar() or payload.car_rating
            car.rating = round(float(avg), 2)

    # Update driver average rating
    if payload.driver_rating and booking.driver_id:
        drv_result = await db.execute(select(Driver).where(Driver.id == booking.driver_id))
        drv = drv_result.scalar_one_or_none()
        if drv:
            avg_result = await db.execute(
                select(func.avg(Review.driver_rating)).where(Review.driver_id == booking.driver_id)
            )
            avg = avg_result.scalar() or payload.driver_rating
            drv.rating = round(float(avg), 2)

    await db.commit()
    await db.refresh(review)
    return ReviewOut.model_validate(review)


@router.get("/car/{car_id}", response_model=List[ReviewOut])
async def car_reviews(car_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.car_id == car_id))
    return [ReviewOut.model_validate(r) for r in result.scalars().all()]


@router.get("/driver/{driver_id}", response_model=List[ReviewOut])
async def driver_reviews(driver_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.driver_id == driver_id))
    return [ReviewOut.model_validate(r) for r in result.scalars().all()]
