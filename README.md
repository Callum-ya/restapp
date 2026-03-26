# SwipeBite

SwipeBite is a lightweight restaurant discovery app designed to reduce decision fatigue by narrowing down nearby restaurant options using filters (dietary, cuisine, distance).

The backend queries OpenStreetMap (OSM) via the Overpass API and returns a clean, filtered list of restaurants for the swipe-styled frontend.

---

## Key features

- Data source: **OpenStreetMap (OSM)** via **Overpass API**
- Supported areas: **Greater London only**
    - Requests outside this area return an error (no Overpass call is made)
- Default search radius: **1.5km (1500 metres)**
- Dietary filters supported currently: **halal**, **vegan**, **vegetarian**
- Save & remove functionality: Use “+” to save restaurants and “–” to remove options

---
## How to use
- Open the application in your browser
- Allow location access (if prompted)
- Apply filters such as dietary preferences or distance
- Browse the suggested restaurants
- Use:
      “+” button to save a restaurant
      “–” button to remove a restaurant from your options
- Continue until you find a suitable place to eat

## Scope & Future Improvements
