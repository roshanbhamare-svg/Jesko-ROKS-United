"""
Jesko — Pydantic Schemas
Request/Response validation models for all entities.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, BookingStatus, BookingMode, PaymentStatus


# ══════════════════════════════════════════
# AUTH SCHEMAS
# ══════════════════════════════════════════

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.user


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# ══════════════════════════════════════════
# USER SCHEMAS
# ══════════════════════════════════════════

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    avatar_url: Optional[str] = None
    trust_score: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


# ══════════════════════════════════════════
# CAR SCHEMAS
# ══════════════════════════════════════════

class CarCreate(BaseModel):
    make: str
    model: str
    year: int = Field(..., ge=2000, le=2030)
    color: Optional[str] = None
    license_plate: str
    category: str = "sedan"
    price_per_day: float = Field(..., gt=0)
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    fuel_type: str = "petrol"
    transmission: str = "manual"
    seats: int = 5


class CarUpdate(BaseModel):
    price_per_day: Optional[float] = None
    is_available: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class CarOut(BaseModel):
    id: str
    owner_id: str
    make: str
    model: str
    year: int
    color: Optional[str] = None
    license_plate: str
    category: str
    price_per_day: float
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available: bool
    image_url: Optional[str] = None
    description: Optional[str] = None
    fuel_type: str
    transmission: str
    seats: int
    rating: float
    total_trips: int
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# DRIVER SCHEMAS
# ══════════════════════════════════════════

class DriverCreate(BaseModel):
    license_number: str
    experience_years: int = Field(..., ge=0)
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DriverUpdate(BaseModel):
    is_available: Optional[bool] = None
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DriverOut(BaseModel):
    id: str
    user_id: str
    license_number: str
    experience_years: int
    is_available: bool
    current_location: Optional[str] = None
    rating: float
    total_trips: int
    acceptance_rate: float
    cancellation_rate: float
    driver_score: float
    is_verified: bool
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# BOOKING SCHEMAS
# ══════════════════════════════════════════

class BookingCreate(BaseModel):
    car_id: str
    driver_id: Optional[str] = None
    mode: BookingMode = BookingMode.self_drive
    pickup_location: str
    dropoff_location: str
    start_date: datetime
    end_date: datetime
    notes: Optional[str] = None

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    id: str
    user_id: str
    car_id: str
    driver_id: Optional[str] = None
    mode: BookingMode
    status: BookingStatus
    pickup_location: str
    dropoff_location: str
    start_date: datetime
    end_date: datetime
    total_days: int
    base_amount: float
    commission: float
    driver_fee: float
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    car: Optional[CarOut] = None
    driver: Optional[DriverOut] = None

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# PAYMENT SCHEMAS
# ══════════════════════════════════════════

class PaymentCreate(BaseModel):
    booking_id: str
    method: str = "card"


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: float
    status: PaymentStatus
    method: str
    transaction_id: Optional[str] = None
    owner_payout: Optional[float] = None
    driver_payout: Optional[float] = None
    platform_commission: Optional[float] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# REVIEW SCHEMAS
# ══════════════════════════════════════════

class ReviewCreate(BaseModel):
    booking_id: str
    car_rating: Optional[float] = Field(None, ge=1, le=5)
    driver_rating: Optional[float] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    booking_id: str
    reviewer_id: str
    car_id: Optional[str] = None
    driver_id: Optional[str] = None
    car_rating: Optional[float] = None
    driver_rating: Optional[float] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# CHATBOT SCHEMAS
# ══════════════════════════════════════════

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None


# ══════════════════════════════════════════
# AI / ML SCHEMAS
# ══════════════════════════════════════════

class RecommendationRequest(BaseModel):
    location: Optional[str] = None
    max_price: Optional[float] = None
    category: Optional[str] = None
    limit: int = 5


class DemandPredictionRequest(BaseModel):
    location: str
    date: str  # YYYY-MM-DD


class DemandPredictionResponse(BaseModel):
    location: str
    date: str
    predicted_demand: str  # low / medium / high
    demand_score: float
    recommended_price_multiplier: float


# Update forward reference
Token.model_rebuild()
