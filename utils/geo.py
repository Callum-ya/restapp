# Geospatial helper functions used for distance calculations.

import math

def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Return great-circle distance in metres between two WGS84 coordinates."""
    r = 6371000.0  # metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c