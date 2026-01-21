// Handle form submission
document.getElementById('pin-form').addEventListener('submit', function(e) {
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
    document.getElementById('photo-name').textContent = 'No file selected';
    document.getElementById('photo-preview').classList.add('hidden');
    if (window.currentMarker) {
        window.map.removeLayer(window.currentMarker);
        window.currentMarker = null;
    }
});

function addPinToMap(pin) {
    const marker = L.marker([pin.latitude, pin.longitude]).addTo(window.map)
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

// Add sample pins when page loads
document.addEventListener('DOMContentLoaded', function() {
    samplePins.forEach(pin => {
        addPinToMap(pin);
        addPinToList(pin);
    });
});