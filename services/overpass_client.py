# Overpass API client for querying nearby food venues

import requests

_OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def build_query(lat: float, lon: float, radius_m: int = 1500) -> str:
    # Build an Overpass QL query for restaurants/fast_food/cafes near a point
    # Safety bounds to avoid massive queries
    radius_m = max(200, min(int(radius_m), 5000))

    return f"""
[out:json][timeout:25];
(
  node(around:{radius_m},{lat},{lon})["amenity"~"restaurant|fast_food|cafe"];
  way(around:{radius_m},{lat},{lon})["amenity"~"restaurant|fast_food|cafe"];
  relation(around:{radius_m},{lat},{lon})["amenity"~"restaurant|fast_food|cafe"];
);
out center tags;
""".strip()

def fetch_osm(lat: float, lon: float, radius_m: int = 1500) -> dict:
    # Execute Overpass request and return parsed JSON response
    query = build_query(lat, lon, radius_m)

    try:
        resp = requests.post(
            _OVERPASS_URL,
            data=query.encode("utf-8"),
            headers={
                "Content-Type": "text/plain",
                "User-Agent": "SwipeBites/1.0 (student project)"
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as ex:
        raise RuntimeError(f"Overpass request failed: {ex}") from ex
    except ValueError as ex:
        # JSON decode error
        raise RuntimeError("Overpass returned a non-JSON response (possible overload).") from ex