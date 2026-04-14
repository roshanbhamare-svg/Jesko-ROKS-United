"""
Jesko — Drivers Router
Driver registration, availability, and profile management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.database import get_db
from app.models.models import Driver, User, UserRole
from app.schemas.schemas import DriverCreate, DriverOut, DriverUpdate
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


@router.post("/register", response_model=DriverOut, status_code=201)
async def register_driver(
    payload: DriverCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register current user as a driver (role must be 'driver')."""
    if current_user.role not in (UserRole.driver, UserRole.admin):
        raise HTTPException(status_code=403, detail="Only users with role 'driver' can register")

    # Check for duplicate
    result = await db.execute(select(Driver).where(Driver.user_id == current_user.id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Driver profile already exists")

    driver = Driver(**payload.model_dump(), user_id=current_user.id)
    db.add(driver)
    await db.commit()
    await db.refresh(driver)

    # Eagerly load user for response
    await db.refresh(driver, ["user"])
    out = DriverOut.model_validate(driver)
    out.user = None  # avoid circular nesting
    return out


@router.get("/", response_model=List[DriverOut])
async def list_drivers(
    available_only: bool = Query(True),
    location: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List available drivers (public)."""
    query = select(Driver)
    if available_only:
        query = query.where(Driver.is_available == True)
    query = query.limit(limit)
    result = await db.execute(query)
    drivers = result.scalars().all()
    return [DriverOut.model_validate(d) for d in drivers]


@router.get("/me", response_model=DriverOut)
async def my_driver_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the driver profile of the logged-in user."""
    result = await db.execute(select(Driver).where(Driver.user_id == current_user.id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    return DriverOut.model_validate(driver)


@router.get("/{driver_id}", response_model=DriverOut)
async def get_driver(driver_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return DriverOut.model_validate(driver)


@router.put("/me", response_model=DriverOut)
async def update_driver(
    payload: DriverUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Driver updates their own availability / location."""
    result = await db.execute(select(Driver).where(Driver.user_id == current_user.id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(driver, field, value)
    await db.commit()
    await db.refresh(driver)
    return DriverOut.model_validate(driver)
