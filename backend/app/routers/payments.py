"""
Jesko — Payments Router
Simulates payment processing & payout breakdown.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import Payment, Booking, BookingStatus, PaymentStatus, User
from app.schemas.schemas import PaymentCreate, PaymentOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# Payout split constants
OWNER_SHARE = 0.80   # 80% of base amount goes to car owner
DRIVER_SHARE = 0.85  # 85% of driver fee goes to driver


@router.post("/", response_model=PaymentOut, status_code=201)
async def process_payment(
    payload: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Simulate payment for a booking.
    Only the booking user can pay, and booking must be accepted/ongoing.
    """
    result = await db.execute(select(Booking).where(Booking.id == payload.booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status not in (BookingStatus.accepted, BookingStatus.ongoing, BookingStatus.requested):
        raise HTTPException(status_code=400, detail=f"Cannot pay for booking in status: {booking.status}")

    # Check if payment already exists
    p_result = await db.execute(select(Payment).where(Payment.booking_id == booking.id))
    if p_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Payment already processed for this booking")

    # Calculate payouts
    owner_payout = round(booking.base_amount * OWNER_SHARE, 2)
    driver_payout = round(booking.driver_fee * DRIVER_SHARE, 2)
    platform_commission = round(booking.total_amount - owner_payout - driver_payout, 2)

    payment = Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        status=PaymentStatus.completed,
        method=payload.method,
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        owner_payout=owner_payout,
        driver_payout=driver_payout,
        platform_commission=platform_commission,
        paid_at=datetime.utcnow(),
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return PaymentOut.model_validate(payment)


@router.get("/{booking_id}", response_model=PaymentOut)
async def get_payment(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get payment details for a booking."""
    result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentOut.model_validate(payment)
