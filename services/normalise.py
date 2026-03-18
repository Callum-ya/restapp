# Normalisation utilities for converting Overpass data into Restaurant models

from typing import Dict, Any, List, Optional
from models.restaurant import Restaurant

_ALLOWED_DIETARY = {"halal", "vegan", "vegetarian"}

def _coords(el: Dict[str, Any]) -> Optional[tuple[float, float]]:
    # Extract latitude/longitude from an Overpass element when available
    if el.get("type") == "node" and "lat" in el and "lon" in el:
        return float(el["lat"]), float(el["lon"])

    center = el.get("center")
    if center and "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])

    return None

def _parse_cuisines(tags: Dict[str, Any]) -> List[str]:
    # Parse semicolon-separated cuisine tags into normalised lowercase values
    raw = (tags.get("cuisine") or "").strip()
    if not raw:
        return []
    cuisines = [p.strip().lower() for p in raw.split(";") if p.strip()]
    return cuisines

def _derive_dietary(tags: Dict[str, Any]) -> set[str]:
    # Derive supported dietary labels from OSM tags
    dietary = set()

    # Vegan / vegetarian
    if tags.get("diet:vegan") == "yes":
        dietary.add("vegan")
    if tags.get("diet:vegetarian") == "yes":
        dietary.add("vegetarian")

    # Halal verified
    if tags.get("diet:halal") == "yes" or tags.get("halal") == "yes":
        dietary.add("halal")

    # Keep only supported tags
    return set([d for d in dietary if d in _ALLOWED_DIETARY])

def normalise_overpass(data: Dict[str, Any]) -> List[Restaurant]:
    # Convert raw Overpass JSON into deduplicated Restaurant objects
    results: List[Restaurant] = []
    seen: set[tuple[str, int]] = set()

    for el in data.get("elements", []):
        tags = el.get("tags") or {}

        name = (tags.get("name") or "").strip()
        if not name:
            # Validation: skip unnamed items
            continue

        xy = _coords(el)
        if not xy:
            continue

        osm_type = el.get("type")
        osm_id = el.get("id")
        if osm_type is None or osm_id is None:
            continue

        key = (str(osm_type), int(osm_id))
        if key in seen:
            continue
        seen.add(key)

        website = tags.get("website") or tags.get("contact:website") or tags.get("url")

        results.append(Restaurant(
            osm_type=str(osm_type),
            osm_id=int(osm_id),
            name=name,
            lat=xy[0],
            lon=xy[1],
            cuisines=_parse_cuisines(tags),
            dietary=_derive_dietary(tags),
            website=website
        ))

    return results