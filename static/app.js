// --- 1. GLOBAL STATE ---
let allRestaurants = []; // This stays populated from your initial Fetch
let filtList = [];       // This changes based on your filters
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;

// --- 2. DATA INITIALIZATION ---
// This runs once when the page loads to get data from your Python backend
async function loadInitialData() {
    try {
        const response = await fetch('/get_restaurants'); // Replace with your actual Flask route
        allRestaurants = await response.json();
        console.log("Data Loaded:", allRestaurants.length);
        
        // Auto-run filters once to start the app
        applyFilters();
    } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        document.getElementById("card").innerHTML = "<h3>Error loading data.</h3>";
    }
}

// --- 3. FILTER LOGIC ---
function applyFilters() {
    currentIndex = 0; // Always restart at the first card

    const maxDist = parseFloat(document.getElementById("dist-input").value) || 1.5;
    const selectedDiets = Array.from(document.querySelectorAll(".diet-check:checked")).map(cb => cb.value);

    // Filter logic
    filtList = allRestaurants.filter(rest => {
        const distMatch = rest.distance_km <= maxDist;
        const dietMatch = selectedDiets.length === 0 || 
                         selectedDiets.every(d => rest.dietary && rest.dietary.includes(d));
        return distMatch && dietMatch;
    });

    console.log("Filtered Matches:", filtList.length);
    updateUI();
}

// --- 4. GESTURE ENGINE (Swipe Physics) ---
function initSwipe() {
    const card = document.getElementById("card");
    if (!card || filtList.length === 0 || currentIndex >= filtList.length) return;

    // Remove old listeners to prevent "double-swiping"
    card.replaceWith(card.cloneNode(true));
    const newCard = document.getElementById("card");

    newCard.addEventListener("mousedown", startSwipe);
    newCard.addEventListener("touchstart", startSwipe, { passive: false });
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
    
    const rotation = currentX / 15;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

    // Feedback colors
    if (currentX > 50) card.style.backgroundColor = "#e6fffa"; // Green tint
    else if (currentX < -50) card.style.backgroundColor = "#fff5f5"; // Red tint
    else card.style.backgroundColor = "white";
}

function endSwipe() {
    isDragging = false;
    document.removeEventListener("mousemove", moveSwipe);
    document.removeEventListener("touchmove", moveSwipe);
    
    if (Math.abs(currentX) > 120) {
        animateOut(currentX > 0 ? "right" : "left");
    } else {
        const card = document.getElementById("card");
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translateX(0) rotate(0)";
        card.style.backgroundColor = "white";
    }
}

function animateOut(direction) {
    const card = document.getElementById("card");
    const moveX = direction === "right" ? 1000 : -1000;
    
    card.style.transition = "transform 0.5s ease-in";
    card.style.transform = `translateX(${moveX}px) rotate(${moveX / 20}deg)`;

    setTimeout(() => {
        currentIndex++;
        updateUI();
    }, 300);
}

// --- 5. UI RENDERER ---
function updateUI() {
    const card = document.getElementById("card");
    const counter = document.getElementById("counter");
    if (!card) return;

    // Reset Visuals
    card.style.transition = "none";
    card.style.transform = "translateX(0) rotate(0)";
    card.style.backgroundColor = "white";
    currentX = 0;

    // Handle Empty or End states
    if (filtList.length === 0) {
        counter.innerText = "0 of 0";
        card.innerHTML = "<h3>No matches found.</h3><p>Try wider filters!</p>";
        return;
    }

    if (currentIndex >= filtList.length) {
        counter.innerText = `${filtList.length} of ${filtList.length}`;
        card.innerHTML = "<h3>All caught up!</h3><button onclick='applyFilters()'>Restart</button>";
        return;
    }

    // Prepare Restaurant Data
    const current = filtList[currentIndex];
    counter.innerText = `Card ${currentIndex + 1} of ${filtList.length}`;

    // DEFENSIVE WEBSITE LINK
    let websiteHTML = "";
    if (current.website && current.website !== "null") {
        let cleanUrl = current.website.trim();
        if (!cleanUrl.startsWith("http")) cleanUrl = `https://${cleanUrl}`;
        websiteHTML = `<a href="${cleanUrl}" target="_blank" class="website-btn">🌐 View Website</a>`;
    }

    // Inject Content
    card.innerHTML = `
        <div class="restaurant-content">
            <h2>${current.name}</h2>
            <p>📍 ${current.distance_km.toFixed(1)} km away</p>
            <p><strong>Cuisines:</strong> ${current.cuisines ? current.cuisines.join(", ") : "Various"}</p>
            <div class="tags">
                ${current.dietary ? current.dietary.map(t => `<span class="tag">${t}</span>`).join("") : ""}
            </div>
            ${websiteHTML}
        </div>
    `;

    // Re-bind the Swipe Engine to the new HTML
    initSwipe();
}

// Start the app
window.onload = loadInitialData;