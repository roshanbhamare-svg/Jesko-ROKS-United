"""
Jesko — Admin Router
Admin-only endpoints for platform management.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.models import User, Car, Driver, Booking, Payment, BookingStatus
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def platform_stats(
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide KPI dashboard for admin."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_cars = (await db.execute(select(func.count(Car.id)))).scalar()
    total_drivers = (await db.execute(select(func.count(Driver.id)))).scalar()
    total_bookings = (await db.execute(select(func.count(Booking.id)))).scalar()
    completed = (await db.execute(
        select(func.count(Booking.id)).where(Booking.status == BookingStatus.completed)
    )).scalar()
    total_revenue = (await db.execute(select(func.sum(Payment.platform_commission)))).scalar() or 0

    return {
        "total_users": total_users,
        "total_cars": total_cars,
        "total_drivers": total_drivers,
        "total_bookings": total_bookings,
        "completed_bookings": completed,
        "platform_revenue": round(float(total_revenue), 2),
        "completion_rate": round(completed / total_bookings * 100, 1) if total_bookings else 0,
    }


@router.get("/users")
async def list_all_users(
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]


@router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: str,
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Activate/deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return {"error": "User not found"}
    user.is_active = not user.is_active
    await db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.patch("/drivers/{driver_id}/verify")
async def verify_driver(
    driver_id: str,
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Mark a driver as verified."""
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        return {"error": "Driver not found"}
    driver.is_verified = True
    await db.commit()
    return {"driver_id": driver_id, "is_verified": True}
