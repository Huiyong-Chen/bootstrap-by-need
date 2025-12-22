const _DOMS = {
    selectRoleContainer: document.getElementById("selectRoleContainer"),
};
// 绘制角色选择器
export function renderRolesSelector(roles) {
    if (!roles.length) {
        _DOMS.selectRoleContainer.style.display = "none";
    }
    else {
    }
}
