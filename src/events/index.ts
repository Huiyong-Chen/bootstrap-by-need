type Handler = (...args: any[]) => void;

interface EventItem {
  callback: Handler;
  once?: boolean;
}

class EventListener<T extends Record<string, any[]> = Record<string, any[]>> {
  // 使用 Map 存储，Key 是事件名，Value 是存放处理函数的 Set
  private events = new Map<keyof T, Set<EventItem>>();
  /** 触发事件 */
  emit<K extends keyof T>(eventName: K, ...args: T[K]) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }

    const handlersSnapshot = [...handlers];

    for (const handler of handlersSnapshot) {
      if (handler.once) {
        handlers.delete(handler);
      }

      try {
        handler.callback(...args);
      } catch (error) {
        console.error(`Error in event "${String(eventName)}":`, error);
      }
    }

    if (handlers.size === 0) {
      this.events.delete(eventName);
    }
  }

  /** 监听事件 */
  on<K extends keyof T>(eventName: K, callback: Handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add({ callback, once: false });
  }
  /** 取消监听 */
  off(eventName: string, callback: Function) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }

    for (const item of handlers) {
      if (item.callback === callback) {
        handlers.delete(item);
        break;
      }
    }

    if (handlers.size === 0) {
      this.events.delete(eventName);
    }
  }

  /** 只监听一次 */
  once<K extends keyof T>(eventName: K, callback: Handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add({ callback, once: true });
  }

  /** 清除特定事件或所有事件 */
  removeAll(eventName?: keyof T) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}

export const eventListener = new EventListener();
