
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

let currentUser = null;
let mapInstance = null;

// Initialize application
document.addEventListener('DOMContentLoaded', async function () {
    feather.replace();

    // Verify Supabase
    if (!window.supabaseClient) {
        console.error('Supabase not initialized. Check config.js');
        alert('System Error: Database connection failed. Please check console.');
        return;
    }

    // Initialize map
    initMap();

    // Setup Auth
    setupAuth();

    // Fetch and display pins
    await fetchPins();

    // Subscribe to Realtime Changes (New, Delete, Update)
    window.supabaseClient
        .channel('public:pins')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, (payload) => {
            console.log('Realtime change detected:', payload);
            fetchPins(); // Refresh to show/hide pins for everyone
        })
        .subscribe();

    // Setup photo preview
    setupPhotoPreview();

    // Setup Form
    setupForm();
});

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Zurich coordinates
    const map = L.map('map').setView([47.3769, 8.5417], 13);
    window.map = map;
    mapInstance = map;

    // CartoDB Dark Matter Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add Locate Control
    const locateControl = L.control({ position: 'topright' });
    locateControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = `<button style="background-color: white; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Locate Me">
                           <i data-feather="crosshair" style="width: 16px; height: 16px; color: #333;"></i>
                         </button>`;
        div.onclick = function (e) {
            e.preventDefault();
            map.locate({ setView: true, maxZoom: 16 });
        };
        return div;
    };
    locateControl.addTo(map);

    // Initial feather replace for the control
    feather.replace();

    // Map click handler
    map.on('click', async function (e) {
        // If user is not logged in, show the auth reminder modal
        if (!currentUser) {
            openModal('auth-modal');
        }

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Set hidden inputs
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');

        if (latInput) latInput.value = lat.toFixed(6);
        if (lngInput) lngInput.value = lng.toFixed(6);

        // Show loading state
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = "Finding address...";

        // Reverse Geocoding using Nominatim
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            if (addressInput) {
                if (data && data.display_name) {
                    addressInput.value = data.display_name;
                } else {
                    addressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                }
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            if (addressInput) addressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        // Remove existing marker if any
        if (window.currentMarker) {
            map.removeLayer(window.currentMarker);
        }

        // Add new marker
        window.currentMarker = L.marker(e.latlng, { icon: customIcon }).addTo(map)
            .bindPopup("Selected Location").openPopup();
    });
}

function setupPhotoPreview() {
    const photoInput = document.getElementById('photo');
    if (!photoInput) return;

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const nameEl = document.getElementById('photo-name');
            if (nameEl) nameEl.textContent = file.name;

            const preview = document.getElementById('preview-image');
            const previewContainer = document.getElementById('photo-preview');

            const reader = new FileReader();
            reader.onload = function (event) {
                if (preview) preview.src = event.target.result;
                if (previewContainer) previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupForm() {
    const form = document.getElementById('pin-form');
    if (!form) return;

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!currentUser) {
            openModal('auth-modal');
            return;
        }

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

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Pin This Treasure';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Posting...';
            feather.replace();
        }

        try {
            // 1. Upload Photo if exists
            let photoUrl = null;
            if (photoInput.files.length > 0) {
                const file = photoInput.files[0];

                // File validation
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    throw new Error('Image size too large. Please choose an image under 5MB.');
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${currentUser.id}/${fileName}`;

                const { error: uploadError } = await window.supabaseClient.storage
                    .from('treasure-photos')
                    .upload(filePath, file);

                if (uploadError) {
                    throw new Error('Failed to upload photo: ' + uploadError.message);
                }

                // Get public URL
                const { data } = window.supabaseClient.storage
                    .from('treasure-photos')
                    .getPublicUrl(filePath);

                photoUrl = data.publicUrl;
            }

            // 2. Insert into Database
            const { error } = await window.supabaseClient
                .from('pins')
                .insert({
                    title,
                    description,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    photo_url: photoUrl,
                    user_id: currentUser.id
                });

            if (error) {
                throw error;
            }

            // 3. Success!
            // Reset form
            this.reset();
            const addressInput = document.getElementById('address');
            if (addressInput) addressInput.value = '';

            const photoName = document.getElementById('photo-name');
            if (photoName) photoName.textContent = 'No file selected';

            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview) photoPreview.classList.add('hidden');

            if (window.currentMarker) {
                window.map.removeLayer(window.currentMarker);
                window.currentMarker = null;
            }

            // Refresh pins
            await fetchPins();

        } catch (error) {
            console.error('Error adding pin:', error);
            alert(error.message || 'Failed to add treasure. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                feather.replace();
            }
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function fetchPins() {
    const container = document.getElementById('pins-container');
    if (!container) return;

    const { data: pins, error } = await window.supabaseClient
        .from('pins')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pins:', error);
        container.innerHTML = '<p class="text-center text-gray-500">Failed to load treasures.</p>';
        return;
    }

    // Clear list and markers ONLY after we successfully got new data
    // This prevents race conditions where multiple rapid calls (init + realtime) cause duplication
    container.innerHTML = '';
    window.pinMarkers = {};
    if (window.map) {
        window.map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer !== window.currentMarker) {
                window.map.removeLayer(layer);
            }
        });
    }

    if (pins.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No treasures found yet. Be the first to pin one!</p>';
        return;
    }

    pins.forEach(pin => {
        const displayPin = {
            id: pin.id,
            title: pin.title,
            description: pin.description,
            latitude: pin.latitude,
            longitude: pin.longitude,
            photo: pin.photo_url,
            photo: pin.photo_url,
            date: new Date(pin.created_at).toLocaleDateString(),
            user_id: pin.user_id
        };

        addPinToMap(displayPin);
        addPinToList(displayPin);
    });
}

function setupAuth() {
    const navbar = document.querySelector('custom-navbar');

    if (navbar) {
        // Listen for custom event from the component
        navbar.addEventListener('auth-click', async () => {
            if (currentUser) {
                await window.supabaseClient.auth.signOut();
            } else {
                signIn();
            }
        });
    }

    // Listen for global trigger-auth event (from modal)
    document.addEventListener('trigger-auth', () => {
        signIn();
    });

    // Listen to state changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user;
        updateAuthUI();
        // Re-fetch pins to update UI (e.g., Delete buttons) based on new auth state
        fetchPins();
    });
}


function updateAuthUI() {
    const navbar = document.querySelector('custom-navbar');
    if (navbar && navbar.updateAuthUI) {
        navbar.updateAuthUI(currentUser);
    }
}

async function signIn() {
    const email = prompt("Enter your email to receive a login link:");
    if (!email) return;

    // console.log('Attempting to sign in with email:', email);
    const { data, error } = await window.supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: window.location.href
        }
    });

    // console.log('SignIn Response:', { data, error });

    if (error) {
        console.error('SignIn Error:', error);

        if (error.message.includes('rate limit') || error.status === 429) {
            alert('Too many login attempts. Please wait 60 seconds before trying again.\n\nTip: You may have already received a login link. Check your inbox!');
        } else {
            alert('Error sending magic link: ' + error.message);
        }
    } else {
        alert('Magic link sent to ' + email + '!\nCheck your spam folder.');
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        feather.replace();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('auth-modal');
    if (event.target == modal) {
        closeModal('auth-modal');
    }
}

function addPinToMap(pin) {
    if (!window.map) return;

    // XSS Prevention: Escape content before putting in HTML string
    const safeTitle = escapeHtml(pin.title);
    const safeDesc = escapeHtml(pin.description || 'No description');
    const safeDate = escapeHtml(pin.date);

    // Securely create popup content
    const popupContent = `
        <div class="pin-popup">
            <h3 class="font-bold">${safeTitle}</h3>
            ${pin.photo ? `<img src="${pin.photo}" class="w-full h-32 object-cover mb-2 rounded" alt="Treasure photo">` : ''}
            <p class="text-sm">${safeDesc}</p>
            <p class="text-xs text-gray-500 mt-1">Posted: ${safeDate}</p>
            ${currentUser && currentUser.id === pin.user_id ?
            `<button onclick="deletePin(${pin.id})" class="mt-2 w-full bg-orange-100 hover:bg-orange-200 text-[#F87342] text-xs py-1 px-2 rounded transition-colors">
                    <i data-feather="trash-2" class="w-3 h-3 inline"></i> Delete Pin
                 </button>` : ''}
        </div>
    `;

    const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon }).addTo(window.map)
        .bindPopup(popupContent);

    pin.marker = marker;

    // Store in global map for easy access
    if (!window.pinMarkers) window.pinMarkers = {};
    window.pinMarkers[pin.id] = marker;
}

function addPinToList(pin) {
    const pinsContainer = document.getElementById('pins-container');
    if (!pinsContainer) return;

    const safeTitle = escapeHtml(pin.title);
    const safeDesc = escapeHtml(pin.description || 'No description provided');
    const safeDate = escapeHtml(pin.date);

    const pinElement = document.createElement('div');
    pinElement.className = 'pin-card bg-white p-4 rounded-lg shadow-md border border-gray-200';
    pinElement.innerHTML = `
        <div class="flex gap-4">
            ${pin.photo ? `
                <div class="w-24 h-24 flex-shrink-0">
                    <img src="${pin.photo}" class="w-full h-full object-cover rounded" alt="Treasure photo">
                </div>
            ` : ''}
            <div class="flex-1">
                <h4 class="font-semibold text-lg">${safeTitle}</h4>
                <p class="text-gray-600 text-sm mt-1">${safeDesc}</p>
                <div class="flex items-center mt-2 text-xs text-gray-500">
                    <i data-feather="map-pin" class="w-4 h-4 mr-1"></i>
                    <span>${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}</span>
                </div>
                <div class="flex items-center mt-1 text-xs text-gray-500">
                    <i data-feather="calendar" class="w-4 h-4 mr-1"></i>
                    <span>${safeDate}</span>
                </div>
                <div class="flex items-center gap-4 mt-2">
                    <button onclick="focusOnPin(${pin.id})" class="text-[#957FFD] hover:text-[#7C66E3] text-sm flex items-center transition-colors">
                        <i data-feather="eye" class="w-4 h-4 mr-1"></i> View on map
                    </button>
                    ${currentUser && currentUser.id === pin.user_id ?
            `<button onclick="deletePin(${pin.id})" class="text-[#F87342] hover:text-[#F2B8A2] text-sm flex items-center transition-colors">
                        <i data-feather="trash-2" class="w-4 h-4 mr-1"></i> Delete
                     </button>` : ''}
                </div>
            </div>
        </div>
    `;
    // Removed absolute positioning class
    // pinElement.classList.add('relative');
    pinsContainer.append(pinElement);
    feather.replace();
}

window.deletePin = async function (id) {
    if (!confirm('Are you sure you want to delete this treasure? This cannot be undone.')) {
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('pins')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Refresh UI
        await fetchPins();
        alert('Treasure deleted successfully.');

    } catch (err) {
        console.error('Error deleting pin:', err);
        alert('Failed to delete pin: ' + err.message);
    }
}

// Make globally available
window.focusOnPin = function (pinId) {
    if (!window.map || !window.pinMarkers) return;

    const marker = window.pinMarkers[pinId];
    if (marker) {
        // Pan to marker and open popup
        window.map.setView(marker.getLatLng(), 15);
        marker.openPopup();

        // Scroll to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.warn('Marker not found for pin:', pinId);
    }
}
window.openModal = openModal;
window.closeModal = closeModal;