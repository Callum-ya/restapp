# Filtering logic for applying user criteria to restaurant results

from typing import List
from models.restaurant import Restaurant
from models.filters import FilterSpec
from utils.geo import haversine_m

def apply_filters(
    restaurants: List[Restaurant],
    user_lat: float,
    user_lon: float,
    spec: FilterSpec
) -> List[Restaurant]:
    # Apply distance, dietary, and cuisine filters, then sort by distance
    required_dietary = {d.lower() for d in spec.dietary_required}  # Strict AND
    cuisine_filter = {c.lower() for c in spec.cuisines}            # OR

    out: List[Restaurant] = []

    for r in restaurants:
        # compute distance for all
        r.distance_m = haversine_m(user_lat, user_lon, r.lat, r.lon)

        # distance filter
        if spec.max_distance_m and r.distance_m > spec.max_distance_m:
            continue

        # dietary strict AND
        if required_dietary and not required_dietary.issubset({d.lower() for d in r.dietary}):
            continue

        # cuisine OR
        if cuisine_filter and not set([c.lower() for c in r.cuisines]).intersection(cuisine_filter):
            continue

        out.append(r)

    # sort by distance
    out.sort(key=lambda x: x.distance_m if x.distance_m is not None else 10**12)
    return out