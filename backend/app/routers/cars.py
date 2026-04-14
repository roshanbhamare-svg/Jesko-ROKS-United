"""
Jesko — Cars Router
CRUD for car listings with owner-only write access.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from app.database import get_db
from app.models.models import Car, User, UserRole
from app.schemas.schemas import CarCreate, CarOut, CarUpdate
from app.middleware.auth import get_current_user, require_owner

router = APIRouter(prefix="/api/cars", tags=["Cars"])


@router.post("/", response_model=CarOut, status_code=201)
async def add_car(
    payload: CarCreate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    """Owner adds a new car listing."""
    car = Car(**payload.model_dump(), owner_id=current_user.id)
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return CarOut.model_validate(car)


@router.get("/", response_model=List[CarOut])
async def search_cars(
    location: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    available_only: bool = Query(True),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """Search / filter available cars."""
    query = select(Car)
    conditions = []

    if available_only:
        conditions.append(Car.is_available == True)
    if location:
        conditions.append(Car.location.ilike(f"%{location}%"))
    if category:
        conditions.append(Car.category == category)
    if min_price is not None:
        conditions.append(Car.price_per_day >= min_price)
    if max_price is not None:
        conditions.append(Car.price_per_day <= max_price)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    cars = result.scalars().all()
    return [CarOut.model_validate(c) for c in cars]


@router.get("/my", response_model=List[CarOut])
async def my_cars(
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    """Owner gets their own cars."""
    result = await db.execute(select(Car).where(Car.owner_id == current_user.id))
    return [CarOut.model_validate(c) for c in result.scalars().all()]


@router.get("/{car_id}", response_model=CarOut)
async def get_car(car_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).where(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return CarOut.model_validate(car)


@router.put("/{car_id}", response_model=CarOut)
async def update_car(
    car_id: str,
    payload: CarUpdate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Car).where(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not your car")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(car, field, value)
    await db.commit()
    await db.refresh(car)
    return CarOut.model_validate(car)


@router.delete("/{car_id}", status_code=204)
async def delete_car(
    car_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Car).where(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not your car")
    await db.delete(car)
    await db.commit()
