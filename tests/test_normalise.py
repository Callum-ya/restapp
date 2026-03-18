# Unit tests for dietary-tag normalization logic

from services.normalise import _derive_dietary

def test_halal_from_diet_tag():
    # Halal should be inferred from diet:halal=yes
    assert "halal" in _derive_dietary({"diet:halal": "yes"})

def test_halal_from_simple_tag():
    # Halal should also be inferred from halal=yes
    assert "halal" in _derive_dietary({"halal": "yes"})

def test_vegan_and_vegetarian():
    # Vegan and vegetarian should both be derived when present.
    dietary = _derive_dietary({"diet:vegan": "yes", "diet:vegetarian": "yes"})
    assert "vegan" in dietary
    assert "vegetarian" in dietary
