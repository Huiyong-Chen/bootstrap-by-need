import { domClassToggle } from "../doms/utils.js";
const _DOMS = {
    emptyRole: document.getElementById("emptyRole"),
};
// 切换选择角色为空时的显示与隐藏
export function toggleEmptyRoleDisplay(hidden) {
    domClassToggle(_DOMS.emptyRole, 'hidden', !hidden);
}
