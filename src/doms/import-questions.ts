import { domClassToggle } from "./utils.js";

export const DOMS = {
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
    createRoleForm: document.getElementById("createRoleForm") as HTMLFormElement,
    // 新建人员表单提交按钮
    createRoleFormSubmitBtm: document.getElementById(
        "createRoleFormSubmitBtn"
    ) as HTMLButtonElement,
    // 导入题库-选择岗位提示
    importPlaceholder: document.getElementById(
        "importPlaceholder"
    ) as HTMLDivElement,
    // 导入题库容器
    importerSection: document.getElementById("importerSection") as HTMLDivElement,
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
};



// #region =============== DOM 状态变更 ===============

export function importPlaceholderDisplay(hidden: boolean) {
    domClassToggle(DOMS.importPlaceholder, "hidden", !hidden);
}
export function importerSectionDisplay(hidden: boolean) {
    domClassToggle(DOMS.importerSection, "hidden", !hidden);
}
export function existingRolesCtnDisplay(hidden: boolean) {
    domClassToggle(DOMS.existingRolesCtn, "hidden", !hidden);
}
export function manualFormDisplay(hidden: boolean) {
    domClassToggle(DOMS.manualForm, "hidden", !hidden);
}
export function importFormCtnDisplay(hidden: boolean) {
    domClassToggle(DOMS.importForm, "hidden", !hidden);
}
export function manualBtnActive(active: boolean) {
    domClassToggle(DOMS.manualBtn, "active", !active);
}
export function importBtnActive(active: boolean) {
    domClassToggle(DOMS.importBtn, "active", !active);
}
// #endregion =============== DOM 状态变更 ===============