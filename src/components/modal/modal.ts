// Modal 组件类型定义
export interface ModalOptions {
  title?: string;
  content: string;
  type?: "info" | "success" | "warning" | "error";
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  closable?: boolean;
}

// Modal 管理器类
class ModalManager {
  private modalElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private isInitialized = false;

  private init() {
    if (this.isInitialized) return;

    // 创建遮罩层
    this.overlayElement = document.createElement("div");
    this.overlayElement.className = "modal-overlay";
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 1000;
      animation: modal-fade-in 0.2s ease-out;
    `;

    // 创建 modal 容器
    this.modalElement = document.createElement("div");
    this.modalElement.className = "modal-container";
    this.modalElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      max-width: 500px;
      z-index: 1001;
      display: none;
      animation: modal-slide-in 0.3s ease-out;
    `;

    // 添加到页面
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.modalElement);

    this.isInitialized = true;
  }

  private createModalContent(options: ModalOptions): HTMLElement {
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // 标题
    if (options.title) {
      const titleElement = document.createElement("div");
      titleElement.className = "modal-title";
      titleElement.textContent = options.title;
      modalContent.appendChild(titleElement);
    }

    // 内容
    const contentElement = document.createElement("div");
    contentElement.className = "modal-body";
    contentElement.textContent = options.content;
    modalContent.appendChild(contentElement);

    // 按钮区域
    const footerElement = document.createElement("div");
    footerElement.className = "modal-footer";

    // 取消按钮
    if (options.showCancel !== false) {
      const cancelButton = document.createElement("button");
      cancelButton.className = "modal-btn modal-btn-cancel";
      cancelButton.textContent = options.cancelText || "取消";
      cancelButton.onclick = () => {
        this.hide();
        options.onCancel?.();
      };
      footerElement.appendChild(cancelButton);
    }

    // 确认按钮
    const confirmButton = document.createElement("button");
    confirmButton.className = `modal-btn modal-btn-confirm modal-btn-${
      options.type || "info"
    }`;
    confirmButton.textContent = options.confirmText || "确定";
    confirmButton.onclick = () => {
      this.hide();
      options.onConfirm?.();
    };
    footerElement.appendChild(confirmButton);

    modalContent.appendChild(footerElement);

    // 关闭按钮
    if (options.closable !== false) {
      const closeButton = document.createElement("button");
      closeButton.className = "modal-close";
      closeButton.innerHTML = "×";
      closeButton.onclick = () => {
        this.hide();
        options.onCancel?.();
      };
      modalContent.appendChild(closeButton);
    }

    return modalContent;
  }

  show(options: ModalOptions) {
    this.init();

    if (!this.modalElement || !this.overlayElement) return;

    // 清空之前的内容
    this.modalElement.innerHTML = "";

    // 创建新的内容
    const content = this.createModalContent(options);
    this.modalElement.appendChild(content);

    // 显示 modal
    this.overlayElement.style.display = "block";
    this.modalElement.style.display = "block";

    // 添加 ESC 键监听
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.hide();
        options.onCancel?.();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // 点击遮罩关闭
    this.overlayElement.onclick = () => {
      this.hide();
      options.onCancel?.();
    };
  }

  hide() {
    if (!this.modalElement || !this.overlayElement) return;

    this.overlayElement.style.display = "none";
    this.modalElement.style.display = "none";
  }
}

// 创建全局 modal 管理器实例
const modalManager = new ModalManager();

// 导出的 API
export const Modal = {
  /**
   * 显示信息弹窗
   */
  alert: (content: string, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      modalManager.show({
        title: title || "提示",
        content,
        type: "info",
        showCancel: false,
        confirmText: "确定",
        onConfirm: resolve,
      });
    });
  },

  /**
   * 显示确认弹窗
   */
  confirm: (content: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      modalManager.show({
        title: title || "确认",
        content,
        type: "warning",
        showCancel: true,
        confirmText: "确定",
        cancelText: "取消",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  },

  /**
   * 显示自定义弹窗
   */
  show: (options: ModalOptions) => {
    modalManager.show(options);
  },

  /**
   * 隐藏当前弹窗
   */
  hide: () => {
    modalManager.hide();
  },
};
