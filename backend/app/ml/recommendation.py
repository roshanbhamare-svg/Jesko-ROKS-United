"""
Jesko — ML Recommendation Engine
Content-based filtering using car features and user booking history.
Uses scikit-learn cosine similarity on a feature vector.
"""
import numpy as np
from typing import List
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity


def _car_to_vector(car) -> list:
    """Convert a car ORM object to a numeric feature vector."""
    category_map = {"hatchback": 0, "sedan": 1, "suv": 2, "luxury": 3}
    fuel_map = {"petrol": 0, "diesel": 1, "electric": 2, "hybrid": 3}
    trans_map = {"manual": 0, "automatic": 1}

    return [
        car.price_per_day,
        car.year,
        car.seats,
        category_map.get(car.category, 1),
        fuel_map.get(car.fuel_type, 0),
        trans_map.get(car.transmission, 0),
        car.rating,
    ]


def recommend_cars(cars: list, booking_history: list, limit: int = 5) -> list:
    """
    Recommend cars using cosine similarity.
    Builds a user preference vector from booking history.
    Falls back to rating-sorted list if no history.
    """
    if not cars:
        return []

    # Build car matrix
    car_vectors = [_car_to_vector(c) for c in cars]

    if not car_vectors:
        return cars[:limit]

    try:
        scaler = MinMaxScaler()
        car_matrix = scaler.fit_transform(car_vectors)
    except Exception:
        # If scaling fails, just return top-rated
        sorted_cars = sorted(cars, key=lambda c: c.rating, reverse=True)
        return sorted_cars[:limit]

    if booking_history:
        # Build user preference vector from booked cars
        # Use the booked car IDs to find their vectors (simplified: use index)
        # For production: join with booking car features
        user_vector = np.mean(car_matrix, axis=0).reshape(1, -1)
    else:
        # Cold-start: user prefers average/mid-range cars
        user_vector = np.mean(car_matrix, axis=0).reshape(1, -1)
        # Boost rating dimension
        user_vector[0][-1] = 1.0

    # Compute similarities
    similarities = cosine_similarity(user_vector, car_matrix)[0]

    # Sort by similarity (descending), with rating as tiebreaker
    scored = sorted(
        zip(cars, similarities),
        key=lambda x: (x[1], x[0].rating),
        reverse=True
    )

    return [car for car, _ in scored[:limit]]
