/* ---------------------------
   Main app class moved from inline HTML
   --------------------------- */
type PenpotMessage = any;
/* ---------------------------
   Small helper: safe query
   --------------------------- */
function $<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}
class AIDesignGenerator {
  private form: HTMLFormElement | null;
  private generateBtn: HTMLButtonElement | null;
  private status: HTMLElement | null;
  private connectionStatus: HTMLElement | null;
  private designTypeSelect: HTMLSelectElement | null;
  private promptTextarea: HTMLTextAreaElement | null;

  constructor() {
    this.form = $<HTMLFormElement>("#designForm");
    this.generateBtn = $<HTMLButtonElement>("#generateBtn");
    this.status = $<HTMLElement>("#status");
    this.connectionStatus = $<HTMLElement>("#connectionStatus");
    this.designTypeSelect = $<HTMLSelectElement>("#designType");
    this.promptTextarea = $<HTMLTextAreaElement>("#prompt");

    this.initAsyncLoad();
    this.initEventListeners();
    this.handleTheme();
  }

  async initAsyncLoad() {
    // Send message to plugin - keep payload consistent with plugin.ts
     console.log('initAsyncLoad' );
    window.parent.postMessage({ type: "get-models" }, "*");
  }

  initEventListeners() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    document.querySelectorAll(".example-item").forEach((item) => {
      item.addEventListener("click", () => this.useExample(item as HTMLElement));
    });

    window.addEventListener("message", (event: MessageEvent<PenpotMessage>) => {
      if (event.data?.source === "penpot") {
        this.handlePenpotMessage(event.data);
      }
    });
  }

  handleTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") || "light";
    document.body.setAttribute("data-theme", theme);

    window.addEventListener("message", (event: MessageEvent<PenpotMessage>) => {
      if (event.data?.type === "themechange") {
        document.body.setAttribute("data-theme", event.data.theme);
      }
    });
  }

  useExample(item: HTMLElement) {
    const type = item.dataset.type ?? "";
    const text = item.textContent?.trim() ?? "";

    if (this.designTypeSelect) this.designTypeSelect.value = type;
    if (this.promptTextarea) {
      this.promptTextarea.value = text;
      this.promptTextarea.focus();
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.form) return;

    const formData = new FormData(this.form);
    const designType = formData.get("designType");
    const prompt = formData.get("prompt");

    if (!designType || !prompt) {
      this.showStatus("Please fill in all fields", "error");
      return;
    }

    this.setLoading(true);
    this.showStatus("Generating design with AI...", "info");

    window.parent.postMessage(
      {
        type: "generate-design",
        prompt,
        designType,
      },
      "*"
    );
  }

  handlePenpotMessage(data: PenpotMessage) {
     console.log('handlePenpotMessage', data );
    if (data.type === "design-generated") {
      this.setLoading(false);
      if (data.success) {
        this.showStatus(data.message || "Design generated successfully!", "success");
      } else {
        this.showStatus(data.message || "Failed to generate design", "error");
      }
    } else if (data.type === "lmconnection") { 
      if (data.data?.status) {
        if (this.connectionStatus) {
          this.connectionStatus.className = "connection-status connected";
          this.connectionStatus.textContent = "🟢 Connected to LM Studio";
        }
      } else {
        if (this.connectionStatus) {
          this.connectionStatus.className = "connection-status disconnected";
          this.connectionStatus.textContent = "🔴 LM Studio not connected (localhost:9000)";
        }
      }
    }
  }

  setLoading(loading: boolean) {
    if (!this.generateBtn) return;
    this.generateBtn.disabled = loading;
    this.generateBtn.classList.toggle("loading", loading);
  }

  showStatus(message: string, type: "info" | "success" | "error") {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    this.status.style.display = "block";

    if (type === "success" || type === "error") {
      setTimeout(() => {
        this.status && (this.status.style.display = "none");
      }, 5000);
    }
  }
}

/* ---------------------------
   Instantiate on DOM ready
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure the module-run order: URL theme applied above already
  // Instantiate the UI app
  new AIDesignGenerator();
});