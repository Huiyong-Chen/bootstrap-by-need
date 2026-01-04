// 基础处理器类型 - 绑定到具体事件类型
type Handler<T extends unknown[] = unknown[]> = (...args: T) => void;

interface EventItem<T extends unknown[] = unknown[]> {
  callback: Handler<T>;
  once?: boolean;
}

/**
 * 类型化事件监听器类
 * 支持泛型参数定义具体的事件类型映射
 */
class EventListener<T extends Record<string, unknown[]> = Record<string, unknown[]>> {
  // 使用 Map 存储，Key 是事件名，Value 是存放处理函数的 Set
  private events = new Map<keyof T, Set<EventItem<unknown[]>>>();
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
        (handler.callback as Handler<T[K]>)(...args);
      } catch (error) {
        console.error(`Error in event "${String(eventName)}":`, error);
      }
    }

    if (handlers.size === 0) {
      this.events.delete(eventName);
    }
  }

  /** 监听事件 */
  on<K extends keyof T>(eventName: K, callback: Handler<T[K]>) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add({
      callback: callback as Handler<unknown[]>,
      once: false,
    });
  }

  /** 取消监听 */
  off<K extends keyof T>(eventName: K, callback: Handler<T[K]>) {
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
  once<K extends keyof T>(eventName: K, callback: Handler<T[K]>) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add({
      callback: callback as Handler<unknown[]>,
      once: true,
    });
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

// 应用事件类型映射
interface AppEventMap extends Record<string, unknown[]> {
  'role:add': [role: import('../types/index.types.mts').RoleInfoRecord];
  // 可以在这里扩展其他事件类型
  // 'question:created': [question: QuestionInfo];
  // 'export:completed': [data: ExportData];
}

// 导出类型化的实例
export const eventListener = new EventListener<AppEventMap>();
