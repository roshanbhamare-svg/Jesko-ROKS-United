"""
Jesko — Bookings Router
Full booking lifecycle: Requested → Accepted → Ongoing → Completed
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.database import get_db
from app.models.models import Booking, Car, Driver, User, BookingStatus, BookingMode, UserRole
from app.schemas.schemas import BookingCreate, BookingOut, BookingStatusUpdate
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

# ── Business constants ─────────────────────────
PLATFORM_COMMISSION_RATE = 0.10   # 10%
DRIVER_DAY_FEE = 800.0            # ₹800/day flat driver fee


def _calculate_amounts(car: Car, days: int, mode: BookingMode) -> dict:
    base = car.price_per_day * days
    commission = round(base * PLATFORM_COMMISSION_RATE, 2)
    driver_fee = DRIVER_DAY_FEE * days if mode != BookingMode.self_drive else 0.0
    total = round(base + commission + driver_fee, 2)
    return {"base_amount": base, "commission": commission, "driver_fee": driver_fee, "total_amount": total}


@router.post("/", response_model=BookingOut, status_code=201)
async def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User creates a booking request."""
    # Fetch car
    result = await db.execute(select(Car).where(Car.id == payload.car_id))
    car = result.scalar_one_or_none()
    if not car or not car.is_available:
        raise HTTPException(status_code=400, detail="Car not available")

    # If driver-assisted, validate driver exists and is available
    driver = None
    if payload.mode != BookingMode.self_drive and payload.driver_id:
        d_result = await db.execute(select(Driver).where(Driver.id == payload.driver_id))
        driver = d_result.scalar_one_or_none()
        if not driver or not driver.is_available:
            raise HTTPException(status_code=400, detail="Driver not available")

    # Calculate duration & amounts
    days = max(1, (payload.end_date - payload.start_date).days)
    amounts = _calculate_amounts(car, days, payload.mode)

    booking = Booking(
        user_id=current_user.id,
        car_id=payload.car_id,
        driver_id=payload.driver_id,
        mode=payload.mode,
        pickup_location=payload.pickup_location,
        dropoff_location=payload.dropoff_location,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_days=days,
        notes=payload.notes,
        **amounts,
    )
    db.add(booking)

    # Mark car & driver as unavailable
    car.is_available = False
    if driver:
        driver.is_available = False

    await db.commit()
    await db.refresh(booking)
    return BookingOut.model_validate(booking)


@router.get("/", response_model=List[BookingOut])
async def list_bookings(
    status: Optional[BookingStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List bookings:
    - User → their own bookings
    - Owner → bookings for their cars
    - Driver → their own assignments
    - Admin → all
    """
    query = select(Booking)

    if current_user.role == UserRole.user:
        query = query.where(Booking.user_id == current_user.id)
    elif current_user.role == UserRole.driver:
        d_result = await db.execute(select(Driver).where(Driver.user_id == current_user.id))
        driver = d_result.scalar_one_or_none()
        if driver:
            query = query.where(Booking.driver_id == driver.id)
        else:
            return []
    elif current_user.role == UserRole.owner:
        # Get owner's car IDs
        cars_result = await db.execute(select(Car.id).where(Car.owner_id == current_user.id))
        car_ids = [row[0] for row in cars_result.fetchall()]
        query = query.where(Booking.car_id.in_(car_ids))
    # admin: no filter

    if status:
        query = query.where(Booking.status == status)

    result = await db.execute(query.order_by(Booking.created_at.desc()))
    bookings = result.scalars().all()
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingOut.model_validate(booking)


@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Status transitions:
    - Driver / Owner: requested → accepted
    - Driver: accepted → ongoing
    - Driver / Owner / Admin: ongoing → completed
    - Anyone involved: → cancelled
    """
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = payload.status

    # On completion, free up car & driver
    if new_status == BookingStatus.completed:
        car_result = await db.execute(select(Car).where(Car.id == booking.car_id))
        car = car_result.scalar_one_or_none()
        if car:
            car.is_available = True
            car.total_trips += 1

        if booking.driver_id:
            drv_result = await db.execute(select(Driver).where(Driver.id == booking.driver_id))
            drv = drv_result.scalar_one_or_none()
            if drv:
                drv.is_available = True
                drv.total_trips += 1

    # On cancellation also free resources
    if new_status == BookingStatus.cancelled:
        car_result = await db.execute(select(Car).where(Car.id == booking.car_id))
        car = car_result.scalar_one_or_none()
        if car:
            car.is_available = True
        if booking.driver_id:
            drv_result = await db.execute(select(Driver).where(Driver.id == booking.driver_id))
            drv = drv_result.scalar_one_or_none()
            if drv:
                drv.is_available = True
                drv.cancellation_rate = min(1.0, drv.cancellation_rate + 0.05)

    booking.status = new_status
    booking.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(booking)
    return BookingOut.model_validate(booking)
