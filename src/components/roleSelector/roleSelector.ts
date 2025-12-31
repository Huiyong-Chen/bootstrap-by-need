import {
  createFragmentWithElements,
  createOptionElement,
  toggleHiddenClass,
} from "../../utils/domHelpers.js";
import { RoleInfoRecord } from "../../types/index.types.js";

/**
 * 角色选择器组件
 * 用于统一处理角色选择器的渲染逻辑
 */

export interface RoleSelectorConfig {
  selectElement: HTMLSelectElement;
  containerElement: HTMLElement;
  onRoleChange?: (roleId: string) => void;
  emptyStateElement?: HTMLElement;
  badgeElement?: HTMLElement;
}

/**
 * 渲染角色选择器
 * @param roles 角色列表
 * @param config 配置对象
 */
export function renderRoleSelector(
  roles: RoleInfoRecord[],
  config: RoleSelectorConfig
): void {
  const { selectElement, containerElement, onRoleChange, emptyStateElement } =
    config;

  if (roles.length > 0) {
    // 创建包含所有选项的片段（默认空选项 + 角色选项）
    const allOptions = [
      createOptionElement("", "请选择岗位"), // 默认空选项
      ...roles.map((role) => createOptionElement(role.id, role.name)),
    ];

    // 一次性替换所有子元素
    const fragment = createFragmentWithElements(allOptions);
    selectElement.replaceChildren(fragment);

    // 默认选中第一个角色
    selectElement.value = roles[0].id;

    // 显示选择器，隐藏空状态
    toggleHiddenClass(containerElement, false);
    if (emptyStateElement) {
      toggleHiddenClass(emptyStateElement, true);
    }

    // 触发选择变更
    if (onRoleChange) {
      onRoleChange(roles[0].id);
    }
  } else {
    // 清空选项，只保留默认空选项
    selectElement.replaceChildren(createOptionElement("", "请选择岗位"));

    // 隐藏选择器，显示空状态
    toggleHiddenClass(containerElement, true);
    if (emptyStateElement) {
      toggleHiddenClass(emptyStateElement, false);
    }
  }
}

/**
 * 添加新角色到选择器
 * @param role 新角色
 * @param config 配置对象
 */
export function addRoleToSelector(
  role: RoleInfoRecord,
  config: RoleSelectorConfig
): void {
  const { selectElement, containerElement } = config;

  const optionElement = createOptionElement(role.id, role.name);
  selectElement.appendChild(optionElement);

  // 如果之前没有角色，现在有了，需要显示选择器
  if (containerElement.classList.contains("hidden")) {
    toggleHiddenClass(containerElement, false);
  }
}

/**
 * 更新角色徽章文本
 * @param badgeElement 徽章元素
 * @param roleName 角色名称
 */
export function updateRoleBadge(
  badgeElement: HTMLElement,
  roleName: string
): void {
  badgeElement.textContent = `当前岗位：${roleName}`;
}
