import {
  groupQuestionsByType,
  parseAndValidateQuestions,
} from "../../api/questions.js";
import { addRole, getAllRoles } from "../../api/roles.js";
import { eventListener } from "../../events/index.js";
import { toggleClass } from "../../utils/domHelpers.js";
import { saveQuestionBankByRole } from "../../indexed-db/index.js";
import { RoleInfo, RoleInfoRecord } from "../../types/index.types.js";
import {
  addRoleToSelector,
  renderRoleSelector,
} from "../../components/roleSelector/roleSelector.js";
import { Modal } from "../../components/modal/modal.js";

window.addEventListener("DOMContentLoaded", () => {
  // #region =============== DOMS ===============
  const DOMS = {
    // 返回按钮
    backBtn: document.getElementById("backBtn") as HTMLButtonElement,
    // 人员选择器容器
    existingRolesCtn: document.getElementById(
      "existingRolesCtn"
    ) as HTMLDivElement,
    // 人员选择器
    roleSelect: document.getElementById("roleSelect") as HTMLSelectElement,
    // 新建人员Label
    createNewRoleLabel: document.getElementById(
      "createNewRoleLabel"
    ) as HTMLElement,
    // 新建人员表单
    createRoleForm: document.getElementById(
      "createRoleForm"
    ) as HTMLFormElement,
    // 新建人员表单提交按钮
    createRoleFormSubmitBtn: document.getElementById(
      "createRoleFormSubmitBtn"
    ) as HTMLButtonElement,
    // 导入题库-选择岗位提示
    importPlaceholder: document.getElementById(
      "importPlaceholder"
    ) as HTMLDivElement,
    // 导入题库容器
    importerSection: document.getElementById(
      "importerSection"
    ) as HTMLDivElement,
    // 手动导入按钮
    manualBtn: document.getElementById("manualBtn") as HTMLButtonElement,
    // 文件导入按钮
    importBtn: document.getElementById("importBtn") as HTMLButtonElement,
    // 手动输入表单
    manualForm: document.getElementById("manualForm") as HTMLFormElement,
    // 手动输入表单提交按钮
    manualSubmitBtn: document.getElementById(
      "manualSubmitBtn"
    ) as HTMLButtonElement,
    // 文件导入表单
    importForm: document.getElementById("importForm") as HTMLFormElement,
    // 文件导入input
    importFileInput: document.getElementById(
      "importFileInput"
    ) as HTMLInputElement,
    // 导入模式选项
    manualImportMode: document.getElementsByName(
      "manualImportMode"
    ) as NodeListOf<HTMLInputElement>,
    fileImportMode: document.getElementsByName(
      "fileImportMode"
    ) as NodeListOf<HTMLInputElement>,
  };
  // #endregion =============== DOMS ===============

  // #region =============== 返回按钮 ===============

  /**
   * 返回按钮点击处理
   * 使用浏览器历史记录返回上一页
   */
  DOMS.backBtn.onclick = (e) => {
    if (history.length > 1) {
      e.preventDefault();
      history.back();
    }
  };

  // #endregion =============== 返回按钮 ===============

  // #region =============== 角色选择器 ===============

  // 监听角色添加事件，动态更新选择器选项
  eventListener.on("role:add", appendSelectorOption);

  // 角色选择变更事件绑定
  DOMS.roleSelect.onchange = roleSelectChange;

  /**
   * 角色选择变更处理函数
   * 根据选择的角色显示或隐藏相应的界面元素
   */
  function roleSelectChange() {
    if (DOMS.roleSelect.value) {
      toggleClass(DOMS.importPlaceholder, "hidden", false);
      toggleClass(DOMS.importerSection, "hidden", true);
    } else {
      toggleClass(DOMS.importPlaceholder, "hidden", true);
      toggleClass(DOMS.importerSection, "hidden", false);
    }
  }

  /**
   * 渲染角色选择器
   * @param roles 角色列表
   */
  function rolesSelectorRender(roles: RoleInfoRecord[]) {
    renderRoleSelector(roles, {
      selectElement: DOMS.roleSelect,
      containerElement: DOMS.existingRolesCtn,
      onRoleChange: () => {
        roleSelectChange();
      },
    });

    // import-questions页面的特殊逻辑
    if (roles.length > 0) {
      DOMS.createNewRoleLabel.innerText = "或创建新岗位：";
      toggleClass(DOMS.existingRolesCtn, "hidden", true);
    }
  }

  /**
   * 添加新角色到选择器
   * 当有新角色添加时，动态更新选择器选项
   * @param role 新添加的角色信息
   */
  function appendSelectorOption(role: RoleInfoRecord) {
    if (DOMS.existingRolesCtn.classList.contains("hidden")) {
      // 如果之前没有角色，这是第一个角色，需要重新渲染整个选择器
      rolesSelectorRender([role]);
    } else {
      // 如果已经有角色了，只需要添加新的选项
      addRoleToSelector(role, {
        selectElement: DOMS.roleSelect,
        containerElement: DOMS.existingRolesCtn,
      });
    }
  }

  // #endregion =============== 角色选择器 ===============

  // #region =============== 角色创建表单 ===============

  /**
   * 角色创建表单提交处理
   * 验证表单数据，创建新角色并重置表单
   */
  DOMS.createRoleForm.onsubmit = async (e) => {
    e.preventDefault(); // 阻止默认提交
    const fd = new FormData(DOMS.createRoleForm);
    const data = Object.fromEntries(fd);
    await addRole(data as unknown as RoleInfo);
    DOMS.createRoleForm.reset();
  };

  /**
   * 表单输入验证处理
   * 根据表单有效性启用或禁用提交按钮
   */
  DOMS.createRoleForm.oninput = () => {
    DOMS.createRoleFormSubmitBtn.disabled =
      !DOMS.createRoleForm.checkValidity();
  };
  // #endregion =============== 角色创建表单 ===============

  // #region =============== 题库导入 ===============

  /**
   * 手动导入按钮点击处理
   * 激活手动导入模式，显示手动输入表单
   */
  DOMS.manualBtn.onclick = () => {
    toggleClass(DOMS.manualBtn, "active", false);
    toggleClass(DOMS.manualForm, "hidden", true);

    toggleClass(DOMS.importBtn, "active", true);
    toggleClass(DOMS.importForm, "hidden", false);
  };

  /**
   * 文件导入按钮点击处理
   * 激活文件导入模式，显示文件选择表单
   */
  DOMS.importBtn.onclick = () => {
    toggleClass(DOMS.importBtn, "active", false);
    toggleClass(DOMS.importForm, "hidden", true);

    toggleClass(DOMS.manualBtn, "active", true);
    toggleClass(DOMS.manualForm, "hidden", false);
  };

  /**
   * 手动输入表单提交处理
   * 解析JSON格式的题目数据，验证后保存到数据库
   */
  DOMS.manualForm.onsubmit = async (e) => {
    e.preventDefault(); // 阻止默认提交

    if (!DOMS.roleSelect.value) {
      await Modal.alert("请先选择岗位", "操作提示");
      return;
    }

    const fd = new FormData(DOMS.manualForm);
    const { questions: questionsStr } = Object.fromEntries(fd) as unknown as {
      questions: string;
    };
    if (!questionsStr.trim()) {
      await Modal.alert("请输入题目数据", "输入错误");
      return;
    }
    DOMS.manualSubmitBtn.disabled = true;
    try {
      // 检查并转换数据
      const result = parseAndValidateQuestions(questionsStr);
      if (!result.success || !result.questions) {
        throw new Error(result.error || "导入失败");
      }
      // 按题型分组
      const grouped = groupQuestionsByType(result.questions);

      // 获取导入模式
      const append = getImportMode("manualImportMode");
      await saveQuestionBankByRole(DOMS.roleSelect.value, grouped, append);

      DOMS.manualForm.reset();

      const isConfirmed = await Modal.confirm(
        `成功导入 ${result.questions.length} 道题目，是否前往导出试卷？`,
        "导入成功"
      );
      if (isConfirmed) {
        DOMS.backBtn.click();
      }
    } catch (error) {
      await Modal.alert(
        error instanceof Error ? error.message : "导入失败",
        "导入错误"
      );
    } finally {
      DOMS.manualSubmitBtn.disabled = false;
    }
  };

  /**
   * 手动表单输入验证处理
   * 根据表单有效性启用或禁用提交按钮
   */
  DOMS.manualForm.oninput = () => {
    DOMS.manualSubmitBtn.disabled = !DOMS.manualForm.checkValidity();
  };

  /**
   * 文件导入处理
   * 读取上传的文件内容，解析题目数据并保存
   */
  DOMS.importFileInput.onchange = async (e) => {
    if (!DOMS.roleSelect.value) {
      await Modal.alert("请先选择岗位", "操作提示");
      return;
    }

    const file = (e.target! as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    DOMS.importFileInput.disabled = true;

    try {
      const text = await file.text();
      const result = parseAndValidateQuestions(text);

      if (!result.success || !result.questions) {
        await Modal.alert(result.error || "导入失败", "导入错误");

        DOMS.importFileInput.disabled = false;
        return;
      }

      // 按题型分组
      const grouped = groupQuestionsByType(result.questions);

      // 获取导入模式并保存到 IndexedDB
      const append = getImportMode("fileImportMode");
      await saveQuestionBankByRole(DOMS.roleSelect.value, grouped, append);

      const isConfirmed = await Modal.confirm(
        `成功导入 ${result.questions.length} 道题目，是否前往导出试卷？`,
        "导入成功"
      );
      if (isConfirmed) {
        DOMS.backBtn.click();
      }

      // 清除文件输入
      DOMS.importFileInput.value = "";
    } catch (error) {
      alert(`导入失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      DOMS.importFileInput.disabled = false;
    }
  };

  // #endregion =============== 题库导入 ===============

  // #region =============== 工具函数 ===============

  /**
   * 获取当前选中的导入模式
   * @param modeName 单选框组的name属性 ('manualImportMode' | 'fileImportMode')
   * @returns 是否为追加模式
   */
  function getImportMode(
    modeName: "manualImportMode" | "fileImportMode"
  ): boolean {
    const radios = DOMS[modeName];
    for (const radio of radios) {
      if (radio.checked) {
        return radio.value === "append";
      }
    }
    return false; // 默认覆盖模式
  }

  // #endregion =============== 工具函数 ===============

  // #region =============== 初始化 ===============

  /**
   * 页面初始化函数
   * 加载角色数据并渲染选择器
   */
  async function init() {
    const roles = await getAllRoles();
    rolesSelectorRender(roles);
  }

  init();
});
