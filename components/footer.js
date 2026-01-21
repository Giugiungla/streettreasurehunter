class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
          background-color: #2E2E38;
        }
.footer-link {
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          color: #F87342;
          transform: translateX(2px);
        }
</style>
      <footer class="text-gray-300 py-8 mt-12">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">StreetTreasure Hunter</h3>
              <p class="text-sm">Helping people find and share free items in their community since 2023.</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
              <ul class="space-y-2">
                <li><a href="#" class="footer-link flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> Map</a></li>
                <li><a href="#" class="footer-link flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> Add Item</a></li>
                <li><a href="#" class="footer-link flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Connect</h3>
              <div class="flex space-x-4">
                <a href="#" class="footer-link"><i data-feather="twitter"></i></a>
                <a href="#" class="footer-link"><i data-feather="facebook"></i></a>
                <a href="#" class="footer-link"><i data-feather="instagram"></i></a>
                <a href="#" class="footer-link"><i data-feather="github"></i></a>
              </div>
              <p class="text-xs mt-4">© 2023 StreetTreasure Hunter. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('custom-footer', CustomFooter);