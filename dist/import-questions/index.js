import { groupQuestionsByType, parseAndValidateQuestions } from "../datas/questions.js";
import { addRole, getAllRoles } from "../datas/roles.js";
import { DOMS, existingRolesCtnDisplay, importBtnActive, importerSectionDisplay, importFormCtnDisplay, importPlaceholderDisplay, manualBtnActive, manualFormDisplay } from "../doms/import-questions.js";
import { eventListener } from "../events/index.js";
import { saveQuestionBankByRole } from "../indexed-db/index.js";
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
    eventListener.on("role:add", appendSelectiorOption);
    DOMS.roleSelect.onchange = roleSelectChange;
    function roleSelectChange() {
        if (DOMS.roleSelect.value) {
            importPlaceholderDisplay(true);
            importerSectionDisplay(false);
        }
        else {
            importPlaceholderDisplay(false);
            importerSectionDisplay(true);
        }
    }
    // 人员选择器渲染
    function rolesSelectorRedner(roles) {
        if (roles.length) {
            const fragment = document.createDocumentFragment();
            for (const role of roles) {
                const optionEle = document.createElement("option");
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
        }
        else {
            existingRolesCtnDisplay(true);
        }
    }
    function appendSelectiorOption(role) {
        if (DOMS.existingRolesCtn.classList.contains("hidden")) {
            rolesSelectorRedner([role]);
        }
        else {
            const optionEle = document.createElement("option");
            (optionEle.value = role.id), (optionEle.innerText = role.name);
            DOMS.roleSelect.appendChild(optionEle);
        }
    }
    // #endregion ============ 返回按钮 ===============
    // #region =============== 新增人员表单提交 ===============
    DOMS.createRoleForm.onsubmit = async (e) => {
        e.preventDefault(); // 阻止默认提交
        const fd = new FormData(DOMS.createRoleForm);
        const data = Object.fromEntries(fd);
        await addRole(data);
        DOMS.createRoleForm.reset();
    };
    DOMS.createRoleForm.oninput = () => {
        DOMS.createRoleFormSubmitBtm.disabled =
            !DOMS.createRoleForm.checkValidity();
    };
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
    DOMS.manualForm.onsubmit = async (e) => {
        e.preventDefault(); // 阻止默认提交
        if (!DOMS.roleSelect.value) {
            alert("请先选择岗位");
            return;
        }
        const fd = new FormData(DOMS.manualForm);
        const { questions: questionsStr } = Object.fromEntries(fd);
        if (!questionsStr.trim()) {
            alert("请输入题目数据");
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
            await saveQuestionBankByRole(DOMS.roleSelect.value, grouped);
            DOMS.manualForm.reset();
            const isComfirm = confirm(`成功导入 ${result.questions.length} 道题目， 是否前去导出题型`);
            if (isComfirm) {
                DOMS.backBtn.click();
            }
        }
        catch (error) {
            alert(error);
        }
        finally {
            DOMS.manualSubmitBtn.disabled = false;
        }
    };
    DOMS.manualForm.oninput = () => {
        DOMS.manualSubmitBtn.disabled = !DOMS.manualForm.checkValidity();
    };
    // 文件导入
    DOMS.importFileInput.onchange = async (e) => {
        if (!DOMS.roleSelect.value) {
            alert("请先选择岗位");
            return;
        }
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        DOMS.importFileInput.disabled = true;
        try {
            const text = await file.text();
            const result = parseAndValidateQuestions(text);
            if (!result.success || !result.questions) {
                alert(result.error || "导入失败");
                DOMS.importFileInput.disabled = false;
                return;
            }
            // 按题型分组
            const grouped = groupQuestionsByType(result.questions);
            // 保存到 IndexedDB
            await saveQuestionBankByRole(DOMS.roleSelect.value, grouped);
            const isComfirm = confirm(`成功导入 ${result.questions.length} 道题目， 是否前去导出题型`);
            if (isComfirm) {
                DOMS.backBtn.click();
            }
            // 清除文件输入
            DOMS.importFileInput.value = "";
        }
        catch (error) {
            alert(`导入失败：${error instanceof Error ? error.message : "未知错误"}`);
        }
        finally {
            DOMS.importFileInput.disabled = false;
        }
    };
    // #endregion ============ 导入题库 ===============
    async function init() {
        const roles = await getAllRoles();
        rolesSelectorRedner(roles);
    }
    init();
});
