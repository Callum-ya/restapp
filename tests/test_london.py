# Unit tests for Greater London boundary checks

from utils.london import is_in_greater_london

def test_london_true():
    # Central London coordinates should be accepted
    assert is_in_greater_london(51.5074, -0.1278) is True  # Central London

def test_london_false():
    # Coordinates outside London should be rejected
    assert is_in_greater_london(52.4862, -1.8904) is False  # Birmingham
