# Filtering model definitions used by restaurant search

from dataclasses import dataclass, field
from typing import Set

@dataclass
class FilterSpec:
    # User-selected filtering criteria for search results.
    max_distance_m: float = 1500.0
    cuisines: Set[str] = field(default_factory=set)          # Multi-select OR
    dietary_required: Set[str] = field(default_factory=set)  # M ulti-select strict AND
