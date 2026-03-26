SwipeBite
SwipeBite is a lightweight restaurant discovery app designed to reduce decision fatigue by narrowing down nearby restaurant options using filters (dietary, cuisine, distance).

The backend queries OpenStreetMap (OSM) via the Overpass API and returns a clean, filtered list of restaurants for the swipe-styled frontend.

Key features
Data source: OpenStreetMap (OSM) via Overpass API
Supported areas: Greater London only
Requests outside this area return an error (no Overpass call is made)
Default search radius: 1.5km (1500 metres)
Dietary filters supported currently: halal, vegan, vegetarian
(incomplete, needs to be updated with more info on frontend workings)
