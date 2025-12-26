import { addRole, getAllRoles } from "../datas/roles.js";
import { DOMS, existingRolesCtnDisplay, importBtnActive, importerSectionDisplay, importFormCtnDisplay, importPlaceholderDisplay, manualBtnActive, manualFormDisplay } from "../doms/import-questions.js";
import { eventListener } from "../events/index.js";
import { RoleInfo, RoleInfoRecord } from "../types/index.types.js";
import { RoleFormHandler } from "../handlers/roleFormHandler.js";
import { QuestionImportHandler } from "../handlers/questionImportHandler.js";


window.addEventListener("DOMContentLoaded", () => {
  // #region =============== 返回按钮 ===============
  DOMS.backBtn.onclick = (e) => {
    if (history.length > 1) {
      e.preventDefault();
      history.back();
    }
  };
  // #endregion ============ 返回按钮 ===============

  // #region =============== 人员选择器 ===============

  eventListener.on("role:add", appendSelectorOption);

  DOMS.roleSelect.onchange = roleSelectChange;

  function roleSelectChange() {
    if (DOMS.roleSelect.value) {
      importPlaceholderDisplay(true);
      importerSectionDisplay(false);
    } else {
      importPlaceholderDisplay(false);
      importerSectionDisplay(true);
    }
  }

  // 人员选择器渲染
  function rolesSelectorRender(roles: RoleInfoRecord[]) {
    if (roles.length) {
      const fragment = document.createDocumentFragment();
      for (const role of roles) {
        const optionEle = document.createElement("option") as HTMLOptionElement;
        optionEle.value = role.id;
        optionEle.innerText = role.name;

        fragment.appendChild(optionEle);
      }
      DOMS.roleSelect.appendChild(fragment);
      // 表单添加后，默认选中第一项
      DOMS.roleSelect.value = roles[0].id;
      DOMS.createNewRoleLabel.innerText = "或创建新岗位：";
      existingRolesCtnDisplay(false);
      roleSelectChange();
    } else {
      existingRolesCtnDisplay(true);
    }
  }

  function appendSelectorOption(role: RoleInfoRecord) {
    if (DOMS.existingRolesCtn.classList.contains("hidden")) {
      rolesSelectorRender([role]);
    } else {
      const optionEle = document.createElement("option") as HTMLOptionElement;
      (optionEle.value = role.id), (optionEle.innerText = role.name);
      DOMS.roleSelect.appendChild(optionEle);
    }
  }
  // #endregion ============ 返回按钮 ===============

  // #region =============== 新增人员表单提交 ===============
  DOMS.createRoleForm.onsubmit = (e) =>
    RoleFormHandler.handleCreateRoleSubmit(e, DOMS.createRoleForm);

  DOMS.createRoleForm.oninput =
    RoleFormHandler.handleCreateRoleInput(DOMS.createRoleForm, DOMS.createRoleFormSubmitBtm);
  // #endregion ============ 表单提交 ===============

  // #region =============== 导入题库 ===============
  DOMS.manualBtn.onclick = () => {
    manualBtnActive(true);
    manualFormDisplay(false);

    importBtnActive(false);
    importFormCtnDisplay(true);
  };

  DOMS.importBtn.onclick = () => {
    importBtnActive(true);
    importFormCtnDisplay(false);

    manualBtnActive(false);
    manualFormDisplay(true);
  };

  // 手动输入表单
  DOMS.manualForm.onsubmit = (e) =>
    QuestionImportHandler.handleManualImportSubmit(
      e,
      DOMS.manualForm,
      DOMS.roleSelect,
      DOMS.manualSubmitBtn
    );

  DOMS.manualForm.oninput =
    QuestionImportHandler.handleManualImportInput(DOMS.manualForm, DOMS.manualSubmitBtn);

  // 文件导入
  DOMS.importFileInput.onchange = (e) =>
    QuestionImportHandler.handleFileImportChange(e, DOMS.roleSelect, DOMS.importFileInput);

  // #endregion ============ 导入题库 ===============


  async function init() {
    const roles = await getAllRoles();
    rolesSelectorRender(roles);
  }

  init()
});
