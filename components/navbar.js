class CustomNavbar extends HTMLElement {
  connectedCallback() {
    // Use Light DOM by writing directly to innerHTML (no attachShadow)
    this.innerHTML = `
      <style>
        .navbar {
          background: linear-gradient(135deg, #CFC8F9 0%, #9FA6D8 100%);
          color: #2E2E38;
        }
        .nav-link {
          transition: all 0.3s ease;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 500;
          font-size: 1.1rem;
          color: #F87342;
        }
        .nav-title {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 3.5rem;
            color: #2E2E38;
            text-decoration: none;
            line-height: 1.1;
        }
        .nav-link:hover {
          color: #F87342;
        }
        /* Default hidden */
        #auth-section {
            display: none;
        }
      </style>
      <nav class="navbar shadow-lg">
        <div class="container mx-auto px-12 py-8">
          <div class="flex flex-col items-start gap-4">
            <div class="flex items-center space-x-3">
              <i data-feather="map-pin" class="w-10 h-10 text-[#F87342]"></i>
              <a href="index.html" class="nav-title">Street Treasure Hunter</a>
            </div>
            <div class="flex items-center space-x-6">
              <div id="auth-section" class="flex items-center space-x-4">
                <button id="login-btn" class="text-sm font-medium hover:text-[#F87342] transition-colors">Sign In</button>
              </div>
              <a href="about.html" class="nav-link flex items-center space-x-1">
                <i data-feather="info" class="w-4 h-4"></i>
                <span>About</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    // Bind methods
    this.updateAuthUI = this.updateAuthUI.bind(this);

    // Add event listener
    const btn = this.querySelector('#login-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('auth-click', {
          bubbles: true,
          composed: true
        }));
      });
    }

    // Initialize icons using global feather
    if (window.feather) {
      window.feather.replace(null, this);
    }

    // If explicit attribute exists, show the auth section
    if (this.hasAttribute('show-auth')) {
      const authSection = this.querySelector('#auth-section');
      if (authSection) {
        authSection.style.display = 'flex';
      }
    }
  }

  updateAuthUI(user) {
    const btn = this.querySelector('#login-btn');
    if (btn) {
      btn.textContent = user ? 'Sign Out' : 'Sign In';
    }
  }
}

customElements.define('custom-navbar', CustomNavbar);