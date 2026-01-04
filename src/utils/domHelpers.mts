/**
 * DOM 操作助手函数
 * 用于减少重复的 DOM 操作代码
 */

/**
 * 显示/隐藏元素
 * @param element 要操作的元素
 * @param show 是否显示
 */
export function toggleDisplay(element: HTMLElement, show: boolean): void {
  element.style.display = show ? '' : 'none';
}

/**
 * 切换元素的 hidden 类
 * @param element 要操作的元素
 * @param hidden 是否隐藏
 */
export function toggleHiddenClass(element: HTMLElement, hidden: boolean): void {
  if (hidden) {
    element.classList.add('hidden');
  } else {
    element.classList.remove('hidden');
  }
}

/**
 * 创建选项元素
 * @param value 选项值
 * @param text 显示文本
 * @returns 创建的 option 元素
 */
export function createOptionElement(value: string, text: string): HTMLOptionElement {
  const option = document.createElement('option') as HTMLOptionElement;
  option.value = value;
  option.textContent = text;
  return option;
}

/**
 * 创建文档片段并批量添加子元素
 * @param elements 要添加的元素数组
 * @returns 创建的文档片段
 */
export function createFragmentWithElements(elements: HTMLElement[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  elements.forEach((element) => fragment.appendChild(element));
  return fragment;
}

/**
 * 切换元素的CSS类
 * @param element 要操作的元素
 * @param className 类名
 * @param remove 是否移除类（true=移除，false=添加）
 */
export function toggleClass(
  element: HTMLElement,
  className: string,
  remove: boolean = false,
): void {
  if (remove) {
    element.classList.remove(className);
  } else {
    element.classList.add(className);
  }
}
