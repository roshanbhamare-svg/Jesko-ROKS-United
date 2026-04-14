"""
Jesko — Driver Scoring System
Computes a 0–100 trust/performance score for drivers.
Weights:
  - Rating (40%)
  - Acceptance Rate (30%)
  - Cancellation Rate (20%, inverted)
  - Experience via Total Trips (10%)
"""
import math


def compute_driver_score(
    rating: float,
    acceptance_rate: float,
    cancellation_rate: float,
    total_trips: int,
) -> float:
    """
    Compute a normalized driver score between 0 and 100.

    Parameters
    ----------
    rating : float          — Average rating (1–5 scale)
    acceptance_rate : float — Fraction of bookings accepted (0–1)
    cancellation_rate : float — Fraction of bookings cancelled (0–1)
    total_trips : int       — Total completed trips

    Returns
    -------
    float — Driver score (0–100, higher is better)
    """
    # Normalize rating: 5-star = 100 points
    rating_score = (rating / 5.0) * 40.0

    # Acceptance rate: 100% acceptance = 30 points
    acceptance_score = acceptance_rate * 30.0

    # Cancellation rate: 0% cancellation = 20 points (inverted)
    cancellation_score = (1.0 - min(1.0, cancellation_rate)) * 20.0

    # Experience score: log scale — 100 trips ≈ full 10 points
    experience_score = min(10.0, math.log1p(total_trips) / math.log1p(100) * 10.0)

    raw_score = rating_score + acceptance_score + cancellation_score + experience_score
    return round(min(100.0, max(0.0, raw_score)), 2)


def batch_score_drivers(drivers: list) -> list:
    """Apply scoring to a list of Driver ORM objects."""
    results = []
    for d in drivers:
        score = compute_driver_score(
            rating=d.rating,
            acceptance_rate=d.acceptance_rate,
            cancellation_rate=d.cancellation_rate,
            total_trips=d.total_trips,
        )
        results.append({"driver_id": d.id, "score": score})
    return results
