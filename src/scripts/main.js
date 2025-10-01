// src/main.js

class PenpotPlugin {
  constructor() {
    this.searchParams = new URLSearchParams(window.location.search);
    
    // Initialize elements with jQuery
    this.$connectionStatusEl = $('#connectionStatus');
    this.$btnDesignPage = $('#btn-designPage');
    this.$btnOutput = $('#btn-output');
    this.$btnConfig = $('#btn-config');
    this.$tabContent = $('#tabContent');
    this.$statusEl = $('#status');
    
    this.tabButtons = {
      designPage: this.$btnDesignPage,
      output: this.$btnOutput,
      config: this.$btnConfig,
    };

    this.activeTab = null;

    this.init();
  }

  init() {
    // Apply theme from URL params
    $('body').attr('data-theme', this.searchParams.get("theme") || "light");

    // Set up quick button handler
    this.setupQuickButtonHandler();
    
    // Set up message listeners
    this.setupMessageListeners();
    
    // Wire topbar buttons
    this.setupTabHandlers();
    
    // Startup
    this.openTab('designPage');
  }

  setupQuickButtonHandler() {
    $("[data-handler='create-text']").on("click", () => {
      parent.postMessage({ type: "create-text" }, "*");
    });
  }

  setupMessageListeners() {
    $(window).on("message", (event) => {
      const originalEvent = event.originalEvent;
      if (originalEvent.data?.source === "penpot" && originalEvent.data.theme) {
        $('body').attr('data-theme', originalEvent.data.theme);
      }
    });
  }

  setupTabHandlers() {
    this.$btnDesignPage.on('click', () => this.openTab('designPage'));
    this.$btnOutput.on('click', () => this.openTab('output'));
    this.$btnConfig.on('click', () => this.openTab('config'));
  }

  /** Helper: set connection status */
  setConnection(connected, message) {
    this.$connectionStatusEl
      .toggleClass('connected', connected)
      .toggleClass('disconnected', !connected)
      .text(connected ? `🟢 ${message || 'Connected'}` : `🔴 ${message || 'Disconnected'}`);
  }

  /** Load fragment from public/shared and inject it. */
  async loadFragment(name) {
    const url = `/shared/${name}.html`;
    const response = await $.ajax({
      url: url,
      cache: false,
      error: (xhr, status, error) => {
        throw new Error(`Failed to load ${url}: ${xhr.status} ${error}`);
      }
    });
    return response;
  }

  /** Open tab and render content */
  async openTab(tab) {
    if (this.activeTab === tab) return;
    
    // Update tab buttons
    Object.entries(this.tabButtons).forEach(([k, $btn]) => {
      const isActive = k === tab;
      $btn
        .toggleClass('active', isActive)
        .attr('aria-pressed', String(isActive));
    });
    
    this.activeTab = tab;

    // Show loading state
    this.$tabContent.html(`
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="loading-indicator" aria-hidden="true"></span>
        <span>Loading…</span>
      </div>
    `);

    try {
      if (tab === 'designPage') {
        const html = await this.loadFragment('design-body');
        this.$tabContent.html(html);
        this.initDesignBindings();
      } else if (tab === 'output') {
        this.$tabContent.html(`
          <div id="output-root">
            <div style="color:var(--muted)">
              No design rendered yet. Generate from Design tab.
            </div>
          </div>
        `);
      } else if (tab === 'config') {
        const html = await this.loadFragment('config-body');
        this.$tabContent.html(html);
        this.initConfigBindings();
      }
    } catch (err) {
      this.$tabContent.html(`<div class="status error">Failed to load tab: ${String(err)}</div>`);
    }
  }

  /** When design fragment injected, wire handlers */
  initDesignBindings() {
    // Design bindings implementation using jQuery
    // Example: $('#design-button').on('click', () => { ... });
    
    // Example implementation:
    $('#generate-design').on('click', () => {
      const prompt = $('#design-prompt').val();
      this.generateDesign(prompt);
    });
  }

  /** Example design generation method */
  generateDesign(prompt) {
    this.showStatus('Generating design...', '');
    
    // Simulate API call or processing
    setTimeout(() => {
      this.showStatus('Design generated!', 'success');
      // You could switch to output tab and show the result
      // this.openTab('output');
    }, 2000);
  }

  /** Simple config bindings */
  initConfigBindings() {
    const $saveBtn = $('#saveCfg');
    if (!$saveBtn.length) return;
    
    $saveBtn.on('click', () => {
      const endpoint = $('#cfg-endpoint').val() || '';
      const useGpu = $('#cfg-gpu').is(':checked');
      
      // Persist to localStorage (example)
      localStorage.setItem('plugin_cfg', JSON.stringify({ endpoint, useGpu }));
      this.showStatus('Config saved', 'success');
    });
    
    // Load saved config
    this.loadConfig();
  }

  /** Load saved configuration */
  loadConfig() {
    try {
      const saved = localStorage.getItem('plugin_cfg');
      if (saved) {
        const config = JSON.parse(saved);
        $('#cfg-endpoint').val(config.endpoint || '');
        $('#cfg-gpu').prop('checked', config.useGpu || false);
      }
    } catch (err) {
      console.warn('Failed to load saved config:', err);
    }
  }

  /** Status helper */
  showStatus(message, type = '') {
    this.$statusEl
      .show()
      .removeClass('success error')
      .addClass('status' + (type ? ` ${type}` : ''))
      .text(message);
    
    setTimeout(() => {
      this.$statusEl.hide();
    }, 2500);
  }
}

// Initialize the plugin when the DOM is ready
$(document).ready(() => {
  window.penpotPlugin = new PenpotPlugin();
});