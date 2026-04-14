"""
Jesko — Demand Prediction Module
Predicts high/medium/low demand for car rentals based on
location, day-of-week, and month using a rule-based + slight randomness model.
In production: replace with a trained sklearn/XGBoost model on real booking data.
"""
from datetime import datetime
import random
import math


# Location demand baseline scores (0–1)
LOCATION_DEMAND = {
    "mumbai": 0.90, "delhi": 0.88, "bangalore": 0.85, "pune": 0.80,
    "chennai": 0.78, "hyderabad": 0.75, "kolkata": 0.72, "ahmedabad": 0.68,
    "jaipur": 0.65, "surat": 0.60, "lucknow": 0.58, "nagpur": 0.55,
    "default": 0.50,
}

# Day-of-week multipliers (0=Monday … 6=Sunday)
DAY_MULTIPLIERS = [0.70, 0.72, 0.78, 0.80, 0.90, 1.00, 0.95]

# Month multipliers (peak travel seasons in India)
MONTH_MULTIPLIERS = {
    1: 0.85, 2: 0.80, 3: 0.78, 4: 0.70, 5: 0.72, 6: 0.68,
    7: 0.70, 8: 0.72, 9: 0.78, 10: 0.88, 11: 0.90, 12: 1.00,
}


def predict_demand(location: str, date_str: str) -> dict:
    """
    Predict demand score and category for a location on a given date.
    Returns: location, date, predicted_demand (low/medium/high), demand_score, price_multiplier
    """
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        date = datetime.utcnow()

    loc_key = location.lower().strip()
    loc_score = LOCATION_DEMAND.get(loc_key, LOCATION_DEMAND["default"])
    day_mult = DAY_MULTIPLIERS[date.weekday()]
    month_mult = MONTH_MULTIPLIERS.get(date.month, 0.80)

    # Aggregate score with slight random noise for realism
    noise = random.uniform(-0.05, 0.05)
    raw_score = loc_score * day_mult * month_mult + noise
    demand_score = round(min(1.0, max(0.0, raw_score)), 3)

    # Classify
    if demand_score >= 0.75:
        level = "high"
        price_multiplier = round(1.0 + (demand_score - 0.75) * 1.2, 2)  # up to ~1.3x
    elif demand_score >= 0.45:
        level = "medium"
        price_multiplier = 1.0
    else:
        level = "low"
        price_multiplier = round(0.85 + demand_score * 0.3, 2)  # slight discount

    return {
        "location": location,
        "date": date_str,
        "predicted_demand": level,
        "demand_score": demand_score,
        "recommended_price_multiplier": price_multiplier,
    }
