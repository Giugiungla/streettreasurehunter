// Custom Icon Definition
const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 27 15 27s15-18.716 15-27c0-8.284-6.716-15-15-15z" fill="#957FFD" stroke="#ffffff" stroke-width="1"/>
            <circle cx="15" cy="15" r="5" fill="#ffffff"/>
           </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
});

// Handle form submission
document.getElementById('pin-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const photoInput = document.getElementById('photo');

    if (!latitude || !longitude) {
        alert('Please select a location on the map');
        return;
    }

    if (!title) {
        alert('Please enter a title for the item');
        return;
    }

    // Create a new pin object
    const newPin = {
        id: Date.now(),
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : null,
        date: new Date().toLocaleDateString()
    };

    // Add pin to map
    addPinToMap(newPin);

    // Add pin to sidebar list
    addPinToList(newPin);

    // Reset form
    this.reset();
    document.getElementById('address').value = '';
    document.getElementById('photo-name').textContent = 'No file selected';
    document.getElementById('photo-preview').classList.add('hidden');
    if (window.currentMarker) {
        window.map.removeLayer(window.currentMarker);
        window.currentMarker = null;
    }
});

function addPinToMap(pin) {
    const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon }).addTo(window.map)
        .bindPopup(`
            <div class="pin-popup">
                <h3 class="font-bold">${pin.title}</h3>
                ${pin.photo ? `<img src="${pin.photo}" class="w-full h-32 object-cover mb-2 rounded">` : ''}
                <p class="text-sm">${pin.description || 'No description'}</p>
                <p class="text-xs text-gray-500 mt-1">Posted: ${pin.date}</p>
            </div>
        `);

    // Store marker reference in pin object
    pin.marker = marker;
}

function addPinToList(pin) {
    const pinsContainer = document.getElementById('pins-container');

    const pinElement = document.createElement('div');
    pinElement.className = 'pin-card bg-white p-4 rounded-lg shadow-md border border-gray-200';
    pinElement.innerHTML = `
        <div class="flex gap-4">
            ${pin.photo ? `
                <div class="w-24 h-24 flex-shrink-0">
                    <img src="${pin.photo}" class="w-full h-full object-cover rounded">
                </div>
            ` : ''}
            <div class="flex-1">
                <h4 class="font-semibold text-lg">${pin.title}</h4>
                <p class="text-gray-600 text-sm mt-1">${pin.description || 'No description provided'}</p>
                <div class="flex items-center mt-2 text-xs text-gray-500">
                    <i data-feather="map-pin" class="w-4 h-4 mr-1"></i>
                    <span>${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}</span>
                </div>
                <div class="flex items-center mt-1 text-xs text-gray-500">
                    <i data-feather="calendar" class="w-4 h-4 mr-1"></i>
                    <span>${pin.date}</span>
                </div>
                <button onclick="focusOnPin(${pin.id})" class="mt-2 text-[#F87342] hover:text-[#F2B8A2] text-sm flex items-center">
<i data-feather="eye" class="w-4 h-4 mr-1"></i> View on map
                </button>
            </div>
        </div>
    `;

    pinsContainer.prepend(pinElement);
    feather.replace();
}

function focusOnPin(pinId) {
    // In a real app, you would find the pin by ID and focus on it
    // This is just a placeholder for the functionality
    alert(`Focusing on pin ${pinId} would center the map on its location`);
}

// Sample pins for demo purposes
const samplePins = [
    {
        id: 1,
        title: "Wooden Chair",
        description: "Slightly used but in good condition. Free to take!",
        latitude: 51.505,
        longitude: -0.09,
        photo: "http://static.photos/furniture/320x240/1",
        date: new Date().toLocaleDateString()
    },
    {
        id: 2,
        title: "Books Collection",
        description: "Various novels and textbooks. First come first served!",
        latitude: 51.51,
        longitude: -0.1,
        photo: "http://static.photos/education/320x240/2",
        date: new Date().toLocaleDateString()
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    feather.replace();

    // Initialize map
    const map = L.map('map').setView([47.3769, 8.5417], 13); // Zurich coordinates
    window.map = map;

    // CartoDB Dark Matter Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add sample pins
    samplePins.forEach(pin => {
        addPinToMap(pin);
        addPinToList(pin);
    });

    // Map click handler
    map.on('click', async function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Set hidden inputs
        document.getElementById('latitude').value = lat.toFixed(6);
        document.getElementById('longitude').value = lng.toFixed(6);

        // Show loading state
        const addressInput = document.getElementById('address');
        addressInput.value = "Finding address...";

        // Reverse Geocoding using Nominatim
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            if (data && data.display_name) {
                addressInput.value = data.display_name;
            } else {
                addressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            addressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        // Remove existing marker if any
        if (window.currentMarker) {
            map.removeLayer(window.currentMarker);
        }

        // Add new marker
        window.currentMarker = L.marker(e.latlng, { icon: customIcon }).addTo(map)
            .bindPopup("Selected Location").openPopup();
    });

    // Photo upload preview
    document.getElementById('photo').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('photo-name').textContent = file.name;
            const preview = document.getElementById('preview-image');
            const reader = new FileReader();
            reader.onload = function (event) {
                preview.src = event.target.result;
                document.getElementById('photo-preview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
});