import { domClassToggle } from "./utils.js";
export const DOMS = {
    roleSelector: document.getElementById("roleSelector"),
    roleSelect: document.getElementById("roleSelect"),
    roleBadge: document.getElementById("roleBadge"),
    emptyRole: document.getElementById("emptyRole"),
    weightConfig: document.getElementById("weightConfig"),
    targetScore: document.getElementById("targetScore"),
    ratioList: document.getElementById("ratioList"),
    totalRatio: document.getElementById("totalRatio"),
    randomBtn: document.getElementById("randomBtn"),
    randomResultMessage: document.getElementById("randomResultMessage"),
    generatePager: document.getElementById("generatePager"),
    questionCount: document.getElementById("questionCount"),
    totalScore: document.getElementById("totalScore"),
    remainingScoreCtn: document.getElementById("remainingScoreCtn"),
    remainingScore: document.getElementById("remainingScore"),
    questionList: document.getElementById("questionList"),
    exportQuestionsPager: document.getElementById("exportQuestionsPager"),
};
// 切换选择角色为空时的显示与隐藏
export function emptyRoleDisplay(hidden) {
    domClassToggle(DOMS.emptyRole, 'hidden', !hidden);
}
export function roleSelectorDisplay(hidden) {
    domClassToggle(DOMS.roleSelector, 'hidden', !hidden);
}
export function weightConfigDisplay(hidden) {
    domClassToggle(DOMS.weightConfig, 'hidden', !hidden);
}
export function randomResultMessageDisplay(hidden) {
    domClassToggle(DOMS.randomResultMessage, 'hidden', !hidden);
}
export function generatePagerDisplay(hidden) {
    domClassToggle(DOMS.generatePager, 'hidden', !hidden);
}
export function remainingScoreCtnDisplay(hidden) {
    domClassToggle(DOMS.remainingScoreCtn, 'hidden', !hidden);
}
//#region =============== 事件监听 ===============
//#endregion =============== 事件监听 ===============
