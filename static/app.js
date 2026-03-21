let userPref = { 
    dietary: [],
    maxDistance: 1.5 // in km
};

let userCoords = null; // Will store {lat, lon}
let allRestaurants = []; // Raw data from backend
let filtList = []; // Data after JS filters are applied
let currentIndex = 0;
let matches = [];
let swipeCount = 0;

// X coords for swiping logic
let startX = 0;
let currentX = 0;
let isDragging = false;

// Haversine Formula to calculate distances
// https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
/**
 * Calculates the great-circle distance between two points on a sphere.
 * Returns distance in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // Get angle in radians (Radians = Degrees x (pi/180))
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

// Communicate with backend
async function fetchRestaurants() {
    // Fallback to Goldsmiths if GPS isn't ready
    const coords = userCoords || { lat: 51.4743, lon: -0.0354 }; 
    
    //console.log("Fetching raw data from backend...");

    try {
        const response = await fetch('/api/restaurants/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: coords.lat,
                lon: coords.lon,
                radius_m: 1500 
            })
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        //console.log("Data received:", data.length, "restaurants found.");
        
        allRestaurants = data; 
        applyFilters(); // Initial run

    } catch (error) {
        console.error("Connection Error:", error);
        const card = document.getElementById("card");
        if (card) card.innerHTML = `<h3>Server Error</h3><p>Check if Flask is running.</p>`;
    }
}

// Filtering
function getRecs() {
    if (!allRestaurants || !userCoords) return [];

    return allRestaurants.filter(res => {
        // Calculate distance from user's LIVE location
        const dist = calculateDistance(userCoords.lat, userCoords.lon, res.lat, res.lon);
        res.distance_km = dist; // Attach for UI use

        // Filter by Max Distance
        if (dist > userPref.maxDistance) return false;

        // Filter by Dietary
        const matchesDietary = userPref.dietary.every(req => {
            return res.dietary && res.dietary.map(d => d.toLowerCase()).includes(req.toLowerCase());
        });

        return matchesDietary;
    })
    .sort((a, b) => a.distance_km - b.distance_km); // Closest first
}

// Display updates to user
function updateUI() {
    const card = document.getElementById("card");
    if (!card) return;

    if (filtList.length === 0) {
        card.innerHTML = "<h3>No matches found.</h3><p>Try increasing your distance!</p>";
        // added this to stop the card from swiping left and right when there are no matches -h
        card.replaceWith(card.cloneNode(true));
        return;
    }

    if (currentIndex >= filtList.length) {
        card.innerHTML = "<h3>End of the line!</h3><p>No more restaurants nearby.</p>";
        return;
    }

    const current = filtList[currentIndex];
    const displayDist = current.distance_km.toFixed(1);

    card.innerHTML = `
        <div class="restaurant-content">
            <h2>${current.name}</h2>
            <p class="distance-badge">📍 ${displayDist} km away</p>
            <p><strong>Cuisines:</strong> ${current.cuisines ? current.cuisines.join(", ") : "Various"}</p>
            <div class="tags">
                ${current.dietary ? current.dietary.map(t => `<span class="tag">${t}</span>`).join("") : ""}
            </div>
        </div>
    `;

    initSwipe();
}

function applyFilters() {
    // Get values from the HTML inputs
    const distInput = document.getElementById('dist-input');
    if (distInput) userPref.maxDistance = parseFloat(distInput.value);

    const checkboxes = document.querySelectorAll('.diet-check:checked');
    userPref.dietary = Array.from(checkboxes).map(cb => cb.value);

    // Run the list generation again
    filtList = getRecs();
    currentIndex = 0;
    updateUI();
    updateCounter();
}

// Get user location and set default as Goldsmiths
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                console.log("📍 GPS Locked:", userCoords);
                fetchRestaurants(); // Load data once we know where we are
            },
            (err) => {
                //console.warn("GPS Failed, using fallback.");
                userCoords = { lat: 51.4743, lon: -0.0354 }; // Goldsmiths fallback
                fetchRestaurants();
            }
        );
    }
}

/* function handleSwipe(direction) {
    if (currentIndex < filtList.length) {
        if (direction === "right") matches.push(filtList[currentIndex]);
        currentIndex++;
        updateUI();
        updateCounter();
    }
} */


function initSwipe() {
    const card = document.getElementById("card");
    if (!card || filtList.length === 0 || currentIndex >= filtList.length) return;

    // Reset card visuals for the next item
    card.style.transform = "translateX(0) rotate(0)";
    card.style.backgroundColor = "white";
    currentX = 0;

    card.addEventListener("mousedown", startSwipe);
    card.addEventListener("touchstart", startSwipe, { passive: false });
}

function startSwipe(e) {
    isDragging = true;
    startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    
    document.addEventListener("mousemove", moveSwipe);
    document.addEventListener("touchmove", moveSwipe, { passive: false });
    document.addEventListener("mouseup", endSwipe);
    document.addEventListener("touchend", endSwipe);
    
    document.getElementById("card").style.transition = "none";
}

function moveSwipe(e) {
    if (!isDragging) return;
    const card = document.getElementById("card");
    currentX = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - startX;
    
    // Tilt the card as you drag it
    const rotation = currentX / 15;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
}

function endSwipe() {
    isDragging = false;
    document.removeEventListener("mousemove", moveSwipe);
    document.removeEventListener("touchmove", moveSwipe);

    document.removeEventListener("mouseup", endSwipe);
    document.removeEventListener("touchend", endSwipe);
    
    // If swiped far enough, trigger the choice
    if (Math.abs(currentX) > 120) {
        currentX > 0 ? swipeRight() : swipeLeft();
    } else {
        // Snap back to center
        const card = document.getElementById("card");
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translateX(0) rotate(0)";
    }
}

/* --- 4. COLLEAGUE'S UI ACTIONS --- */

function swipeRight() {
    swipeCount++;
    const card = document.getElementById("card");
    const currentRestaurant = filtList[currentIndex];

    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    const exists = favourites.some(r => r.name === currentRestaurant.name);

    if (!exists) {
        favourites.push({
            name: currentRestaurant.name,
            distance: currentRestaurant.distance_km || 0,
            cuisines: currentRestaurant.cuisines || [],
            dietary: currentRestaurant.dietary || []
        });

        localStorage.setItem("favourites", JSON.stringify(favourites));
    }

    card.classList.add("swipe-right");
    matches.push(currentRestaurant);
    completeAction();
}

function swipeLeft() {
    swipeCount++;
    const card = document.getElementById("card");
    card.classList.add("swipe-left");
    completeAction();
}

function completeAction() {
    setTimeout(() => {
        const card = document.getElementById("card");
        card.classList.remove("swipe-right", "swipe-left");

        if (swipeCount >= 10) {
            card.innerHTML = `
                <h3>Limit reached!</h3>
                <p onclick="window.location.href='static/saved.html'" style="cursor:pointer; color:#0984e3;">
                    Go to your saved restaurants ->
                </p>
`           ;
            card.onmousedown = null;
            card.ontouchstart = null;
            return;
        }

        currentIndex++;
        updateUI();
        updateCounter();
    }, 300);
}

function updateCounter() {
    const counter = document.getElementById('counter');
    if (counter) {
        counter.innerText = filtList.length > 0 
            ? `Card ${currentIndex + 1} of ${filtList.length}` 
            : "No restaurants";
    }
}

// Startup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    getLocation();
});
