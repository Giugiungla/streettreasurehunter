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
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 500;
        }
        .nav-title {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 1.5rem;
            color: #2E2E38;
            text-decoration: none;
        }
        .nav-link:hover {
          color: #F87342;
        }
        /* Import fonts specifically for shadow DOM if needed, 
           or rely on main page import if it cascades (usually fonts do inherit, but imports don't) 
           For robustness, re-importing in shadow DOM or assuming inheritance.
           Inheritance works for font-family if defined on body, but here we define custom styles.
           Let's assume the page loads the font.
        */
      </style>
      <nav class="navbar shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <i data-feather="map-pin" class="w-6 h-6 text-[#F87342]"></i>
              <a href="index.html" class="nav-title">Street Treasure Hunter</a>
            </div>
            <div class="flex items-center space-x-6">
              <a href="about.html" class="nav-link flex items-center space-x-1">
                <i data-feather="info"></i>
                <span>About</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define('custom-navbar', CustomNavbar);