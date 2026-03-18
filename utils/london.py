# Location boundary helpers for London-specific validation

def is_in_greater_london(lat: float, lon: float) -> bool:
    # Check whether a coordinate is inside an approximate Greater London box
    # Approx Greater London bounding box
    south, north = 51.2868, 51.6919
    west, east = -0.5104, 0.3340
    return south <= lat <= north and west <= lon <= east
