# Unit tests for restaurant filtering behaviour

from models.restaurant import Restaurant
from models.filters import FilterSpec
from services.filtering import apply_filters

def test_dietary_strict_and():
    # Only restaurants matching all required dietary tags should remain
    r1 = Restaurant(osm_type="node", osm_id=1, name="A", lat=51.50, lon=-0.12, dietary={"halal"})
    r2 = Restaurant(osm_type="node", osm_id=2, name="B", lat=51.50, lon=-0.12, dietary={"halal", "vegan"})

    spec = FilterSpec(dietary_required={"halal", "vegan"})
    out = apply_filters([r1, r2], user_lat=51.50, user_lon=-0.12, spec=spec)

    assert [r.osm_id for r in out] == [2]