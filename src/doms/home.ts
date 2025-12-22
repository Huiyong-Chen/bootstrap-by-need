import { domClassToggle } from "./utils.js";

export const DOMS = {
    roleSelector: document.getElementById("roleSelector") as HTMLDivElement,
    roleSelect: document.getElementById("roleSelect") as HTMLSelectElement,
    roleBadge: document.getElementById("roleBadge") as HTMLDivElement,
    emptyRole: document.getElementById("emptyRole") as HTMLDivElement,
    weightConfig: document.getElementById("weightConfig") as HTMLDivElement,
    targetScore: document.getElementById("targetScore") as HTMLInputElement,
    ratioList: document.getElementById("ratioList") as HTMLFormElement,
    totalRatio: document.getElementById("totalRatio") as HTMLDivElement,
    randomBtn: document.getElementById("randomBtn") as HTMLButtonElement,
    randomResultMessage: document.getElementById("randomResultMessage") as HTMLDivElement,
    generatePager: document.getElementById("generatePager") as HTMLDivElement,
    questionCount: document.getElementById("questionCount") as HTMLSpanElement,
    totalScore: document.getElementById("totalScore") as HTMLSpanElement,
    remainingScoreCtn: document.getElementById("remainingScoreCtn") as HTMLDivElement,
    remainingScore: document.getElementById("remainingScore") as HTMLSpanElement,
    questionList: document.getElementById("questionList") as HTMLDivElement,
    exportQuestionsPager: document.getElementById("exportQuestionsPager") as HTMLButtonElement,
};

// 切换选择角色为空时的显示与隐藏
export function emptyRoleDisplay(hidden: boolean) {
    domClassToggle(DOMS.emptyRole, 'hidden', !hidden)
}
export function roleSelectorDisplay(hidden: boolean) {
    domClassToggle(DOMS.roleSelector, 'hidden', !hidden)
}
export function weightConfigDisplay(hidden: boolean) {
    domClassToggle(DOMS.weightConfig, 'hidden', !hidden)
}
export function randomResultMessageDisplay(hidden: boolean) {
    domClassToggle(DOMS.randomResultMessage, 'hidden', !hidden)
}
export function generatePagerDisplay(hidden: boolean) {
    domClassToggle(DOMS.generatePager, 'hidden', !hidden)
}
export function remainingScoreCtnDisplay(hidden: boolean) {
    domClassToggle(DOMS.remainingScoreCtn, 'hidden', !hidden)
}



//#region =============== 事件监听 ===============


//#endregion =============== 事件监听 ===============
