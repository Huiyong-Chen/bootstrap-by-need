/**
 * 角色表单处理模块
 * 处理角色创建和选择相关的表单逻辑
 */

import { addRole } from "../datas/roles.js";
import { RoleFormData } from "../types/index.types.js";
import { showError, showSuccess } from "../utils/notification.js";

export class RoleFormHandler {
  static async handleCreateRoleSubmit(e: Event, form: HTMLFormElement) {
    e.preventDefault();

    try {
      const fd = new FormData(form);
      const data = Object.fromEntries(fd) as RoleFormData;
      await addRole({ ...data, id: crypto.randomUUID() });

      showSuccess("角色创建成功");
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "创建角色失败";
      showError(errorMessage);
    }
  }

  static handleCreateRoleInput(form: HTMLFormElement, submitBtn: HTMLButtonElement) {
    return () => {
      submitBtn.disabled = !form.checkValidity();
    };
  }
}
