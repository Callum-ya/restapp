# Restaurant search route definitions and request handling

from flask import Blueprint, request, jsonify
from utils.london import is_in_greater_london
from services.overpass_client import fetch_osm
from services.normalise import normalise_overpass
from services.filtering import apply_filters
from models.filters import FilterSpec



restaurants_bp = Blueprint("restaurants", __name__)

_ALLOWED_DIETARY = {"halal", "vegan", "vegetarian"}

@restaurants_bp.post("/search")
def search():
    # Handle restaurant search requests and return filtered results
    body = request.get_json(force=True) or {}

    # Basic request validation
    if "lat" not in body or "lon" not in body:
        return jsonify({
            "error": "missing_location",
            "message": "lat and lon are required"
        }), 400

    try:
        lat = float(body["lat"])
        lon = float(body["lon"])
    except (TypeError, ValueError):
        return jsonify({
            "error": "invalid_location",
            "message": "lat and lon must be numbers"
        }), 400

    # Greater London restriction
    if not is_in_greater_london(lat, lon):
        return jsonify({
            "error": "outside_supported_area",
            "message": "SwipeBites currently supports Greater London only."
        }), 400

    # Default 1.5km
    radius_m = int(body.get("radius_m", 1500))
    max_distance_m = float(body.get("max_distance_m", 1500))

    # Filters (multi-select)
    cuisines = set([str(x).strip().lower() for x in body.get("cuisines", []) if str(x).strip()])
    dietary_required_raw = [str(x).strip().lower() for x in body.get("dietary_required", [])]
    dietary_required = set([d for d in dietary_required_raw if d in _ALLOWED_DIETARY])

    spec = FilterSpec(
        max_distance_m=max_distance_m,
        cuisines=cuisines,
        dietary_required=dietary_required,
    )

    # Pipeline: fetch -> normalise -> filter -> return
    try:
        raw = fetch_osm(lat, lon, radius_m=radius_m)
    except RuntimeError as ex:
        return jsonify({
            "error": "overpass_failed",
            "message": str(ex)
        }), 502

    restaurants = normalise_overpass(raw)
    filtered = apply_filters(restaurants, user_lat=lat, user_lon=lon, spec=spec)

    return jsonify([r.to_dict() for r in filtered])