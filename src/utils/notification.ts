/**
 * UI 通知管理工具
 * 提供统一的错误提示和成功消息显示
 */

export class NotificationManager {
  private static instance: NotificationManager | null = null;
  private errorContainer: HTMLElement | null = null;
  private successContainer: HTMLElement | null = null;

  private constructor() {
    this.initializeContainers();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private initializeContainers() {
    // 加载CSS样式（如果还没有加载）
    this.loadStyles();

    // 错误消息容器
    this.errorContainer = document.createElement('div');
    this.errorContainer.className = 'notification error-notification';
    document.body.appendChild(this.errorContainer);

    // 成功消息容器
    this.successContainer = document.createElement('div');
    this.successContainer.className = 'notification success-notification';
    document.body.appendChild(this.successContainer);
  }

  private loadStyles() {
    // 检查是否已经加载了通知样式
    if (document.querySelector('style[data-notification-styles]')) {
      return;
    }

    // 将CSS内容直接嵌入到style标签中
    const style = document.createElement('style');
    style.setAttribute('data-notification-styles', 'true');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 300px;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: white;
        animation: slideInRight 0.3s ease-out;
      }

      .notification.error-notification {
        background: #ff4444;
      }

      .notification.success-notification {
        background: #4CAF50;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .notification.fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }

      @media (max-width: 480px) {
        .notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  showError(message: string, duration = 3000) {
    if (!this.errorContainer) return;

    // 移除之前的淡出类
    this.errorContainer.classList.remove('fade-out');
    this.errorContainer.textContent = message;
    this.errorContainer.style.display = 'block';

    setTimeout(() => {
      if (this.errorContainer) {
        this.errorContainer.classList.add('fade-out');
        setTimeout(() => {
          if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.classList.remove('fade-out');
          }
        }, 300); // 等待动画完成
      }
    }, duration);
  }

  showSuccess(message: string, duration = 2000) {
    if (!this.successContainer) return;

    // 移除之前的淡出类
    this.successContainer.classList.remove('fade-out');
    this.successContainer.textContent = message;
    this.successContainer.style.display = 'block';

    setTimeout(() => {
      if (this.successContainer) {
        this.successContainer.classList.add('fade-out');
        setTimeout(() => {
          if (this.successContainer) {
            this.successContainer.style.display = 'none';
            this.successContainer.classList.remove('fade-out');
          }
        }, 300); // 等待动画完成
      }
    }, duration);
  }
}

// 便捷方法
export const showError = (message: string, duration?: number) =>
  NotificationManager.getInstance().showError(message, duration);

export const showSuccess = (message: string, duration?: number) =>
  NotificationManager.getInstance().showSuccess(message, duration);
