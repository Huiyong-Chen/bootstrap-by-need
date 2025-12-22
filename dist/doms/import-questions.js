import { domClassToggle } from "./utils.js";
export const DOMS = {
    // 返回按钮
    backBtn: document.getElementById("backBtn"),
    // 人员选择器容器
    existingRolesCtn: document.getElementById("existingRolesCtn"),
    // 人员选择器
    roleSelect: document.getElementById("roleSelect"),
    // 新建人员Label
    createNewRoleLabel: document.getElementById("createNewRoleLabel"),
    // 新建人员表单
    createRoleForm: document.getElementById("createRoleForm"),
    // 新建人员表单提交按钮
    createRoleFormSubmitBtm: document.getElementById("createRoleFormSubmitBtn"),
    // 导入题库-选择岗位提示
    importPlaceholder: document.getElementById("importPlaceholder"),
    // 导入题库容器
    importerSection: document.getElementById("importerSection"),
    // 手动导入按钮
    manualBtn: document.getElementById("manualBtn"),
    // 文件导入按钮
    importBtn: document.getElementById("importBtn"),
    // 手动输入表单
    manualForm: document.getElementById("manualForm"),
    // 手动输入表单提交按钮
    manualSubmitBtn: document.getElementById("manualSubmitBtn"),
    // 文件导入表单
    importForm: document.getElementById("importForm"),
    // 文件导入input
    importFileInput: document.getElementById("importFileInput"),
};
// #region =============== DOM 状态变更 ===============
export function importPlaceholderDisplay(hidden) {
    domClassToggle(DOMS.importPlaceholder, "hidden", !hidden);
}
export function importerSectionDisplay(hidden) {
    domClassToggle(DOMS.importerSection, "hidden", !hidden);
}
export function existingRolesCtnDisplay(hidden) {
    domClassToggle(DOMS.existingRolesCtn, "hidden", !hidden);
}
export function manualFormDisplay(hidden) {
    domClassToggle(DOMS.manualForm, "hidden", !hidden);
}
export function importFormCtnDisplay(hidden) {
    domClassToggle(DOMS.importForm, "hidden", !hidden);
}
export function manualBtnActive(active) {
    domClassToggle(DOMS.manualBtn, "active", !active);
}
export function importBtnActive(active) {
    domClassToggle(DOMS.importBtn, "active", !active);
}
// #endregion =============== DOM 状态变更 ===============
