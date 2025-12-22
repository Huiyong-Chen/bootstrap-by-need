class EventListener {
    // 使用 Map 存储，Key 是事件名，Value 是存放处理函数的 Set
    events = new Map();
    /** 触发事件 */
    emit(eventName, ...args) {
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
            }
            catch (error) {
                console.error(`Error in event "${String(eventName)}":`, error);
            }
        }
        if (handlers.size === 0) {
            this.events.delete(eventName);
        }
    }
    /** 监听事件 */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        this.events.get(eventName).add({ callback, once: false });
    }
    /** 取消监听 */
    off(eventName, callback) {
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
    once(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        this.events.get(eventName).add({ callback, once: true });
    }
    /** 清除特定事件或所有事件 */
    removeAll(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        }
        else {
            this.events.clear();
        }
    }
}
export const eventListener = new EventListener();
