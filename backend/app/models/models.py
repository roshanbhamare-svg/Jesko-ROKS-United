"""
Jesko — SQLAlchemy ORM Models
All database tables are defined here.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Boolean, DateTime,
    ForeignKey, Integer, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def gen_uuid():
    return str(uuid.uuid4())


# ─────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────

class UserRole(str, enum.Enum):
    user = "user"
    owner = "owner"
    driver = "driver"
    admin = "admin"


class BookingStatus(str, enum.Enum):
    requested = "requested"
    accepted = "accepted"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class BookingMode(str, enum.Enum):
    self_drive = "self_drive"
    driver_assisted = "driver_assisted"
    emergency = "emergency"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    refunded = "refunded"


# ─────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)
    avatar_url = Column(String, nullable=True)
    trust_score = Column(Float, default=5.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    cars = relationship("Car", back_populates="owner", foreign_keys="Car.owner_id")
    driver_profile = relationship("Driver", back_populates="user", uselist=False)
    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")


# ─────────────────────────────────────────────
# CARS
# ─────────────────────────────────────────────

class Car(Base):
    __tablename__ = "cars"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    make = Column(String, nullable=False)       # e.g. "Toyota"
    model = Column(String, nullable=False)      # e.g. "Camry"
    year = Column(Integer, nullable=False)
    color = Column(String, nullable=True)
    license_plate = Column(String, unique=True, nullable=False)
    category = Column(String, default="sedan")  # sedan, suv, hatchback, luxury
    price_per_day = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    fuel_type = Column(String, default="petrol")
    transmission = Column(String, default="manual")
    seats = Column(Integer, default=5)
    rating = Column(Float, default=0.0)
    total_trips = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="cars", foreign_keys=[owner_id])
    bookings = relationship("Booking", back_populates="car")
    reviews = relationship("Review", back_populates="car")


# ─────────────────────────────────────────────
# DRIVERS
# ─────────────────────────────────────────────

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    experience_years = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    current_location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=5.0)
    total_trips = Column(Integer, default=0)
    acceptance_rate = Column(Float, default=1.0)   # 0–1 fraction
    cancellation_rate = Column(Float, default=0.0) # 0–1 fraction
    driver_score = Column(Float, default=100.0)    # AI-computed score
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="driver_profile")
    bookings = relationship("Booking", back_populates="driver")


# ─────────────────────────────────────────────
# BOOKINGS
# ─────────────────────────────────────────────

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    car_id = Column(String, ForeignKey("cars.id"), nullable=False)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True)  # null for self-drive
    mode = Column(SAEnum(BookingMode), default=BookingMode.self_drive)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.requested)
    pickup_location = Column(String, nullable=False)
    dropoff_location = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Integer, nullable=False)
    base_amount = Column(Float, nullable=False)
    commission = Column(Float, nullable=False)  # 10% platform fee
    driver_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    car = relationship("Car", back_populates="bookings")
    driver = relationship("Driver", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    review = relationship("Review", back_populates="booking", uselist=False)


# ─────────────────────────────────────────────
# PAYMENTS
# ─────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=gen_uuid)
    booking_id = Column(String, ForeignKey("bookings.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending)
    method = Column(String, default="card")   # card, upi, wallet
    transaction_id = Column(String, nullable=True)
    owner_payout = Column(Float, nullable=True)
    driver_payout = Column(Float, nullable=True)
    platform_commission = Column(Float, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="payment")


# ─────────────────────────────────────────────
# REVIEWS
# ─────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=gen_uuid)
    booking_id = Column(String, ForeignKey("bookings.id"), unique=True, nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=False)
    car_id = Column(String, ForeignKey("cars.id"), nullable=True)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True)
    car_rating = Column(Float, nullable=True)    # 1–5
    driver_rating = Column(Float, nullable=True) # 1–5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="review")
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    car = relationship("Car", back_populates="reviews")
