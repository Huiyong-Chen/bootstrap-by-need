export function domClassToggle(dom: HTMLElement, className: string, remove: boolean = false) {
    if (remove) {
      dom.classList.remove(className);
    } else {
      dom.classList.add(className);
    }
  }