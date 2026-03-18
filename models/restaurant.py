# Restaurant domain model used across the API pipeline

from dataclasses import dataclass, field
from typing import Optional, List, Set, Dict, Any

@dataclass
class Restaurant:
    # Normalised restaurant record returned by the API
    osm_type: str
    osm_id: int
    name: str
    lat: float
    lon: float

    cuisines: List[str] = field(default_factory=list)
    dietary: Set[str] = field(default_factory=set)  # Halal/vegan/vegetarian only
    website: Optional[str] = None

    distance_m: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        # Convert the dataclass instance to a JSON-serializable dictionary
        return {
            "id": f"{self.osm_type}/{self.osm_id}",
            "osm_type": self.osm_type,
            "osm_id": self.osm_id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
            "cuisines": self.cuisines,
            "dietary": sorted(self.dietary),
            "website": self.website,
            "distance_m": self.distance_m,
        }