// --- 1. GLOBAL STATE ---
let filtList = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;

// --- 2. GESTURE ENGINE (The "Physics") ---
function initSwipe() {
    const card = document.getElementById("card");
    if (!card) return;

    // Mouse Events
    card.addEventListener("mousedown", startSwipe);
    // Touch Events (Mobile)
    card.addEventListener("touchstart", startSwipe, { passive: false });
}

function startSwipe(e) {
    isDragging = true;
    startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    
    // Add listeners to the whole document so the swipe doesn't "break" if the mouse leaves the card
    document.addEventListener("mousemove", moveSwipe);
    document.addEventListener("touchmove", moveSwipe, { passive: false });
    document.addEventListener("mouseup", endSwipe);
    document.addEventListener("touchend", endSwipe);
    
    const card = document.getElementById("card");
    card.style.transition = "none"; // Instant follow-the-finger
}

function moveSwipe(e) {
    if (!isDragging) return;
    const card = document.getElementById("card");
    
    currentX = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - startX;
    const rotation = currentX / 15; // Subtle tilt effect
    
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
    
    // Visual feedback: Tint green for right (Like), red for left (Nope)
    if (currentX > 50) card.style.backgroundColor = "#e6fffa";
    else if (currentX < -50) card.style.backgroundColor = "#fff5f5";
    else card.style.backgroundColor = "white";
}

function endSwipe() {
    isDragging = false;
    document.removeEventListener("mousemove", moveSwipe);
    document.removeEventListener("touchmove", moveSwipe);
    
    const card = document.getElementById("card");
    
    // Threshold check (150px)
    if (Math.abs(currentX) > 150) {
        const direction = currentX > 0 ? "right" : "left";
        animateOut(direction);
    } else {
        // Reset to center if swipe wasn't far enough
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translateX(0) rotate(0)";
        card.style.backgroundColor = "white";
    }
}

function animateOut(direction) {
    const card = document.getElementById("card");
    const moveOut = direction === "right" ? 1000 : -1000;
    
    card.style.transition = "transform 0.5s ease-in";
    card.style.transform = `translateX(${moveOut}px) rotate(${moveOut / 20}deg)`;

    // Wait for animation to finish before showing next restaurant
    setTimeout(() => {
        console.log(`User swiped ${direction} on ${filtList[currentIndex].name}`);
        currentIndex++;
        updateUI();
    }, 500);
}

// --- 3. UI CONTROLLER (The Rendering) ---
function updateUI() {
    const card = document.getElementById("card");
    if (!card) return;

    // RESET CARD POSITION for the new restaurant
    card.style.transition = "none";
    card.style.transform = "translateX(0) rotate(0)";
    card.style.backgroundColor = "white";
    currentX = 0;

    // Handle Empty States
    if (filtList.length === 0) {
        card.innerHTML = "<h3>No matches found.</h3><p>Try increasing your distance!</p>";
        return;
    }

    if (currentIndex >= filtList.length) {
        card.innerHTML = "<h3>End of the line!</h3><p>No more restaurants nearby.</p>";
        return;
    }

    const current = filtList[currentIndex];
    const displayDist = current.distance_km.toFixed(1);

    // DEFENSIVE WEBSITE LOGIC
    let websiteHTML = "";
    if (current.website && current.website !== "null") {
        let cleanUrl = current.website.trim();
        if (!cleanUrl.startsWith("http")) {
            cleanUrl = `https://${cleanUrl}`;
        }
        websiteHTML = `
            <div class="website-container">
                <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="website-btn">
                    🌐 Visit Website
                </a>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="restaurant-content">
            <h2>${current.name}</h2>
            <p class="distance-badge">📍 ${displayDist} km away</p>
            <p><strong>Cuisines:</strong> ${current.cuisines ? current.cuisines.join(", ") : "Various"}</p>
            <div class="tags">
                ${current.dietary ? current.dietary.map(t => `<span class="tag">${t}</span>`).join("") : ""}
            </div>
            ${websiteHTML}
        </div>
    `;
    
    // Re-initialize listeners on the fresh HTML
    initSwipe();
}