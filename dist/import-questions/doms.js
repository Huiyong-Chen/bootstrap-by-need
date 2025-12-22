import { groupQuestionsByType, parseAndValidateQuestions, } from "../datas/questions.js";
import { addRole } from "../datas/roles.js";
import { _DOMS, existingRolesCtnDisplay, importBtnActive, importerSectionDisplay, importFormCtnDisplay, importPlaceholderDisplay, manualBtnActive, manualFormDisplay } from "../doms/import-questions.js";
import { eventListener } from "../events/index.js";
import { saveQuestionBankByRole } from "../indexed-db/index.js";
// #region =============== 返回按钮 ===============
_DOMS.backBtn.onclick = (e) => {
    backToHome(e);
};
function backToHome(e) {
    if (history.length > 1) {
        e?.preventDefault();
        history.back();
    }
}
// #endregion ============ 返回按钮 ===============
// #region =============== 人员选择器 ===============
eventListener.on("role:add", appendSelectiorOption);
_DOMS.roleSelect.onchange = roleSelectChange;
function roleSelectChange() {
    if (_DOMS.roleSelect.value) {
        importPlaceholderDisplay(true);
        importerSectionDisplay(false);
    }
    else {
        importPlaceholderDisplay(false);
        importerSectionDisplay(true);
    }
}
// 人员选择器渲染
export function rolesSelectorRedner(roles) {
    if (roles.length) {
        const fragment = document.createDocumentFragment();
        for (const role of roles) {
            const optionEle = document.createElement("option");
            (optionEle.value = role.id), (optionEle.innerText = role.name);
            fragment.appendChild(optionEle);
        }
        _DOMS.roleSelect.appendChild(fragment);
        // 表单添加后，默认选中第一项
        _DOMS.roleSelect.value = roles[0].id;
        _DOMS.createNewRoleLabel.innerText = "或创建新岗位：";
        existingRolesCtnDisplay(false);
        roleSelectChange();
    }
    else {
        existingRolesCtnDisplay(true);
    }
}
function appendSelectiorOption(role) {
    if (_DOMS.existingRolesCtn.classList.contains("hidden")) {
        rolesSelectorRedner([role]);
    }
    else {
        const optionEle = document.createElement("option");
        (optionEle.value = role.id), (optionEle.innerText = role.name);
        _DOMS.roleSelect.appendChild(optionEle);
    }
}
// #endregion ============ 返回按钮 ===============
// #region =============== 新增人员表单提交 ===============
_DOMS.createRoleForm.onsubmit = async (e) => {
    e.preventDefault(); // 阻止默认提交
    const fd = new FormData(_DOMS.createRoleForm);
    const data = Object.fromEntries(fd);
    await addRole(data);
    _DOMS.createRoleForm.reset();
};
_DOMS.createRoleForm.oninput = () => {
    _DOMS.createRoleFormSubmitBtm.disabled =
        !_DOMS.createRoleForm.checkValidity();
};
// #endregion ============ 表单提交 ===============
// #region =============== 导入题库 ===============
_DOMS.manualBtn.onclick = () => {
    manualBtnActive(true);
    manualFormDisplay(false);
    importBtnActive(false);
    importFormCtnDisplay(true);
};
_DOMS.importBtn.onclick = () => {
    importBtnActive(true);
    importFormCtnDisplay(false);
    manualBtnActive(false);
    manualFormDisplay(true);
};
// 手动输入表单
_DOMS.manualForm.onsubmit = async (e) => {
    e.preventDefault(); // 阻止默认提交
    if (!_DOMS.roleSelect.value) {
        alert("请先选择岗位");
        return;
    }
    const fd = new FormData(_DOMS.manualForm);
    const { questions: questionsStr } = Object.fromEntries(fd);
    if (!questionsStr.trim()) {
        alert("请输入题目数据");
        return;
    }
    _DOMS.manualSubmitBtn.disabled = true;
    try {
        // 检查并转换数据
        const result = parseAndValidateQuestions(questionsStr);
        if (!result.success || !result.questions) {
            throw new Error(result.error || "导入失败");
        }
        // 按题型分组
        const grouped = groupQuestionsByType(result.questions);
        await saveQuestionBankByRole(_DOMS.roleSelect.value, grouped);
        const isConfirm = confirm(`成功导入 ${result.questions.length} 道题目，是否前往导出题库？`);
        if (isConfirm) {
            backToHome();
        }
        _DOMS.manualForm.reset();
    }
    catch (error) {
        alert(error);
    }
    finally {
        _DOMS.manualSubmitBtn.disabled = false;
    }
};
_DOMS.manualForm.oninput = () => {
    _DOMS.manualSubmitBtn.disabled = !_DOMS.manualForm.checkValidity();
};
// 文件导入
_DOMS.importFileInput.onchange = async (e) => {
    if (!_DOMS.roleSelect.value) {
        alert("请先选择岗位");
        return;
    }
    const file = e.target.files?.[0];
    if (!file) {
        return;
    }
    _DOMS.importFileInput.disabled = true;
    try {
        const text = await file.text();
        const result = parseAndValidateQuestions(text);
        if (!result.success || !result.questions) {
            alert(result.error || "导入失败");
            _DOMS.importFileInput.disabled = false;
            return;
        }
        // 按题型分组
        const grouped = groupQuestionsByType(result.questions);
        // 保存到 IndexedDB
        await saveQuestionBankByRole(_DOMS.roleSelect.value, grouped);
        const isConfirm = confirm(`成功导入 ${result.questions.length} 道题目，是否前往导出题库？`);
        if (isConfirm) {
            backToHome();
        }
        _DOMS.importFileInput.value = "";
    }
    catch (error) {
        alert(`导入失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
    finally {
        _DOMS.importFileInput.disabled = false;
    }
};
// #endregion ============ 导入题库 ===============
