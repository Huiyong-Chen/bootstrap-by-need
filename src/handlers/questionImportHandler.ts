/**
 * 题目导入表单处理模块
 * 处理题目导入相关的表单逻辑
 */

import { groupQuestionsByType, parseAndValidateQuestions } from "../datas/questions.js";
import { saveQuestionBankByRole } from "../indexed-db/index.js";
import { showError, showSuccess } from "../utils/notification.js";

export class QuestionImportHandler {
  static async handleManualImportSubmit(
    e: Event,
    form: HTMLFormElement,
    roleSelect: HTMLSelectElement,
    submitBtn: HTMLButtonElement
  ) {
    e.preventDefault();

    if (!roleSelect.value) {
      showError("请先选择岗位");
      return;
    }

    const fd = new FormData(form);
    const rawData = Object.fromEntries(fd);
    const questionsStr = rawData.questions as string;

    if (!questionsStr.trim()) {
      showError("请输入题目数据");
      return;
    }

    submitBtn.disabled = true;

    try {
      const result = parseAndValidateQuestions(questionsStr);
      if (!result.success || !result.questions) {
        throw new Error(result.error || "导入失败");
      }

      const grouped = groupQuestionsByType(result.questions);
      await saveQuestionBankByRole(roleSelect.value, grouped);

      showSuccess(`成功导入 ${result.questions.length} 道题目`);
      form.reset();

      const isConfirm = confirm("是否前去导出题型？");
      if (isConfirm) {
        // 这里应该通过事件或回调来处理导航
        // 暂时保留原来的逻辑
        history.back();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(errorMessage);
    } finally {
      submitBtn.disabled = false;
    }
  }

  static handleManualImportInput(form: HTMLFormElement, submitBtn: HTMLButtonElement) {
    return () => {
      submitBtn.disabled = !form.checkValidity();
    };
  }

  static async handleFileImportChange(
    e: Event,
    roleSelect: HTMLSelectElement,
    fileInput: HTMLInputElement
  ) {
    if (!roleSelect.value) {
      showError("请先选择岗位");
      return;
    }

    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    fileInput.disabled = true;

    try {
      const text = await file.text();
      const result = parseAndValidateQuestions(text);

      if (!result.success || !result.questions) {
        showError(result.error || "导入失败");
        fileInput.disabled = false;
        return;
      }

      const grouped = groupQuestionsByType(result.questions);
      await saveQuestionBankByRole(roleSelect.value, grouped);

      showSuccess(`成功导入 ${result.questions.length} 道题目`);

      const isConfirm = confirm("是否前去导出题型？");
      if (isConfirm) {
        history.back();
      }

      fileInput.value = "";
    } catch (error) {
      showError(
        `导入失败：${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      fileInput.disabled = false;
    }
  }
}
