class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .navbar {
          background: linear-gradient(135deg, #CFC8F9 0%, #9FA6D8 100%);
          color: #2E2E38;
        }
.nav-link {
          transition: all 0.3s ease;
        }
        .nav-link:hover {
          transform: translateY(-2px);
        }
      </style>
      <nav class="navbar text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <i data-feather="map-pin" class="w-6 h-6"></i>
              <a href="/" class="text-xl font-bold">StreetTreasure Hunter</a>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <a href="#" class="nav-link flex items-center space-x-1">
                <i data-feather="map"></i>
                <span>Map</span>
              </a>
              <a href="#" class="nav-link flex items-center space-x-1">
                <i data-feather="plus-circle"></i>
                <span>Add Item</span>
              </a>
              <a href="#" class="nav-link flex items-center space-x-1">
                <i data-feather="info"></i>
                <span>About</span>
              </a>
            </div>
            <div class="md:hidden">
              <button id="mobile-menu-button" class="focus:outline-none">
                <i data-feather="menu" class="w-6 h-6"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define('custom-navbar', CustomNavbar);