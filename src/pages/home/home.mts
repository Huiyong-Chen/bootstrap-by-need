import "@/styles/index.css";
import "./home.css";

import {
  GeneratedPaper,
  generatePaper,
  loadQuestionBanks,
} from "@/api/questions.mts";
import { getAllRoles } from "@/api/roles.mts";
import { Modal } from "@/components/modal/modal.mts";
import {
  renderRoleSelector,
  updateRoleBadge,
} from "@/components/roleSelector/roleSelector.mts";
import {
  QuestionByType,
  QuestionInfo,
  QuestionType,
  QuestionTypeChineseName,
  QuestionTypeOrder,
  RoleInfoRecord,
} from "@/types/index.types.mts";
import { buildDoc, downloadDoc } from "@/utils/docExporter.mts";
import { toggleClass } from "@/utils/domHelpers.mts";

window.addEventListener("DOMContentLoaded", () => {
  // #region =============== DOMS ===============
  const DOMS = {
    roleSelector: document.getElementById("roleSelector") as HTMLDivElement,
    roleSelect: document.getElementById("roleSelect") as HTMLSelectElement,
    roleBadge: document.getElementById("roleBadge") as HTMLDivElement,
    emptyRole: document.getElementById("emptyRole") as HTMLDivElement,
    weightConfig: document.getElementById("weightConfig") as HTMLDivElement,
    targetScore: document.getElementById("targetScore") as HTMLInputElement,
    ratioList: document.getElementById("ratioList") as HTMLFormElement,
    totalRatio: document.getElementById("totalRatio") as HTMLDivElement,
    randomBtn: document.getElementById("randomBtn") as HTMLButtonElement,
    randomResultMessage: document.getElementById(
      "randomResultMessage"
    ) as HTMLDivElement,
    generatePager: document.getElementById("generatePager") as HTMLDivElement,
    questionCount: document.getElementById("questionCount") as HTMLSpanElement,
    totalScore: document.getElementById("totalScore") as HTMLSpanElement,
    remainingScoreCtn: document.getElementById(
      "remainingScoreCtn"
    ) as HTMLDivElement,
    remainingScore: document.getElementById(
      "remainingScore"
    ) as HTMLSpanElement,
    questionList: document.getElementById("questionList") as HTMLDivElement,
    exportQuestionsPager: document.getElementById(
      "exportQuestionsPager"
    ) as HTMLButtonElement,
  };
  // #endregion =============== DOMS ===============

  // #region =============== 角色选择 ===============

  // 角色选择事件绑定
  DOMS.roleSelect.onchange = roleSelectChange;

  /**
   * 角色选择变更处理函数
   * 根据选择的角色更新界面显示和加载题库数据
   */
  async function roleSelectChange() {
    const selectedRoleId = DOMS.roleSelect.value;
    if (selectedRoleId) {
      const selectedRole = (await getAllRoles()).find(
        (i) => i.id === selectedRoleId
      )!;
      setRoleBadgeText(selectedRole.name);
      toggleClass(DOMS.weightConfig, "hidden", true);
      // 根据所选岗位，匹配题目
      renderQuestionsRatioAndPreviewExport(selectedRoleId);
    } else {
      setRoleBadgeText("");
      toggleClass(DOMS.weightConfig, "hidden", false);
    }
  }

  /**
   * 渲染角色选择器
   * @param roles 角色列表
   */
  function rolesSelectorRender(roles: RoleInfoRecord[]) {
    renderRoleSelector(roles, {
      selectElement: DOMS.roleSelect,
      containerElement: DOMS.roleSelector,
      onRoleChange: (roleId) => {
        const selectedRole = roles.find((r) => r.id === roleId);
        if (selectedRole) {
          setRoleBadgeText(selectedRole.name);
          toggleClass(DOMS.weightConfig, "hidden", true);
          renderQuestionsRatioAndPreviewExport(roleId);
        }
      },
      emptyStateElement: DOMS.emptyRole,
    });
  }

  /**
   * 更新角色徽章显示文本
   * @param roleName 角色名称
   */
  function setRoleBadgeText(roleName: string) {
    updateRoleBadge(DOMS.roleBadge, roleName);
  }

  // #endregion =============== 角色选择 ===============

  // #region =============== 权重配置 ===============

  /**
   * 权重配置表单变更处理
   * 根据权重设置的有效性启用或禁用生成按钮
   */
  DOMS.ratioList.onchange = () => {
    DOMS.randomBtn.disabled =
      !DOMS.ratioList.checkValidity() ||
      !Object.values(questionRatioList).some((i) => i > 0);
  };

  /** 当前选中的角色题库数据，按题型分组 */
  let questionBanks: QuestionByType | null = null;

  /** 各题型的权重配置映射表 */
  let questionRatioList: Partial<Record<QuestionType, number>> = {};

  /**
   * 加载并渲染题库权重配置
   * @param roleId 角色ID
   */
  async function renderQuestionsRatioAndPreviewExport(roleId: string) {
    questionBanks = await loadQuestionBanks(roleId);

    renderQuestionRatio();
  }

  /**
   * 渲染题型权重配置界面
   * 为每个题型创建输入控件和统计信息
   */
  function renderQuestionRatio() {
    if (!questionBanks) {
      return;
    }

    const questionTypes = Object.keys(questionBanks);
    questionRatioList = {};

    const fragment = document.createDocumentFragment();

    questionTypes.forEach((type) => {
      const questionType = +type as QuestionType;

      const typeItemEle = document.createElement("div");
      typeItemEle.classList.add("ratio-item");

      const typeItemInfoEle = document.createElement("div");
      typeItemInfoEle.classList.add("ratio-item-info");

      const typeLabelEle = document.createElement("strong");
      typeLabelEle.innerText = QuestionTypeChineseName[questionType];

      const totalQuestionLabel = document.createElement("span");
      totalQuestionLabel.innerText = `共 ${
        questionBanks![questionType].length
      } 题`;

      const typeRatioEle = document.createElement("input") as HTMLInputElement;

      typeRatioEle.classList.add("ratio-input");
      typeRatioEle.classList.add("input");
      typeRatioEle.name = `questionType${questionType}`;
      typeRatioEle.type = "number";
      typeRatioEle.placeholder = "输入权重";
      typeRatioEle.min = "0";
      typeRatioEle.step = "1";
      typeRatioEle.value = "0";
      typeRatioEle.onchange = (e) => {
        questionRatioChange((e.target as HTMLInputElement).value, questionType);
      };

      typeItemInfoEle.appendChild(typeLabelEle);
      typeItemInfoEle.appendChild(totalQuestionLabel);

      typeItemEle.appendChild(typeItemInfoEle);
      typeItemEle.appendChild(typeRatioEle);

      fragment.appendChild(typeItemEle);
    });
    DOMS.ratioList.replaceChildren(fragment);
  }

  /**
   * 题型权重变更处理
   * @param value 新的权重值
   * @param type 题型
   */
  function questionRatioChange(value: string | number, type: QuestionType) {
    questionRatioList[type] = +value;

    DOMS.totalRatio.innerText = `总权重：${Object.values(
      questionRatioList
    ).reduce((t, c) => t + c, 0)}`;
  }

  // #endregion =============== 权重配置 ===============

  // #region =============== 试卷生成 ===============

  // 试卷生成按钮事件绑定
  DOMS.randomBtn.onclick = generateQuestions;

  /** 当前生成的试卷数据 */
  let generatedPaper: GeneratedPaper | null = null;

  /**
   * 生成随机试卷
   * 根据权重配置从题库中随机抽取题目
   */
  async function generateQuestions() {
    if (+DOMS.targetScore.value <= 0) {
      await Modal.alert("请输入需要生成的总分数", "输入错误");
      return;
    }

    generatedPaper = generatePaper(
      questionBanks!,
      questionRatioList,
      +DOMS.targetScore.value
    );

    const typePriority = (type: QuestionType) => {
      const idx = QuestionTypeOrder.indexOf(type);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    const sortedList = [...generatedPaper.list].sort((a, b) => {
      const typeDiff = typePriority(a.type) - typePriority(b.type);
      if (typeDiff !== 0) return typeDiff;
      return (a.difficulty ?? 0) - (b.difficulty ?? 0);
    });

    if (sortedList.length === 0) {
      await Modal.alert("题库不足，未能生成试卷", "生成失败");
      return;
    }
    if (generatedPaper.shortfall) {
      DOMS.randomResultMessage.innerText = `试题抽完，距离目标还差 ${generatedPaper.shortfall} 分`;
      toggleClass(DOMS.randomResultMessage, "hidden", true);
    }
    renderQuestionPage(
      sortedList,
      generatedPaper.totalScore,
      generatedPaper.shortfall
    );
    await Modal.alert("已生成试卷", "生成成功");
  }

  /**
   * 渲染试卷页面
   * 显示生成的题目列表和统计信息
   * @param questions 生成的题目列表
   * @param totalScore 总分数
   * @param remainingScore 剩余分数（如果有）
   */
  function renderQuestionPage(
    questions: QuestionInfo[],
    totalScore: number,
    remainingScore?: number
  ) {
    DOMS.questionCount.innerText = `${questions.length}`;
    DOMS.totalScore.innerText = `${totalScore}`;
    DOMS.remainingScore.innerText = `${remainingScore ?? 0}`;
    toggleClass(DOMS.remainingScoreCtn, "hidden", !!remainingScore);

    const fragment = document.createDocumentFragment();
    // 题目渲染
    questions.forEach((q, index) => {
      const cardEle = document.createElement("div");
      cardEle.classList.add("question-card");

      const titleEle = document.createElement("div");
      titleEle.classList.add("question-title");
      titleEle.innerText = `${index + 1}. [${
        QuestionTypeChineseName[q.type]
      }] ${q.title} (${q.score}分)`;

      cardEle.appendChild(titleEle);
      if (q.options) {
        const optionsUlEle = document.createElement("ul");
        optionsUlEle.classList.add("options-list");

        q.options.forEach((opt, optIndex) => {
          const optionLiEle = document.createElement("li");
          optionLiEle.classList.add("option-item");

          const optionBadgeEle = document.createElement("span");
          optionBadgeEle.classList.add("option-badge");
          optionBadgeEle.innerText = String.fromCharCode(65 + optIndex);

          const optionTextEle = document.createElement("span");
          optionTextEle.classList.add("option-text");
          optionTextEle.innerText = opt;

          optionLiEle.appendChild(optionBadgeEle);
          optionLiEle.appendChild(optionTextEle);

          optionsUlEle.appendChild(optionLiEle);
        });
        cardEle.appendChild(optionsUlEle);
      }

      const metaEle = document.createElement("div");
      metaEle.classList.add("question-meta");

      const difficultyEle = document.createElement("span");
      difficultyEle.classList.add("meta-item");
      difficultyEle.innerText = `难度：${q.difficulty ?? 1}`;

      const answerEle = document.createElement("span");
      answerEle.classList.add("meta-item", "answer");
      answerEle.innerText = `答案：${q.answer}`;

      metaEle.appendChild(difficultyEle);
      metaEle.appendChild(answerEle);

      cardEle.appendChild(metaEle);

      fragment.appendChild(cardEle);
    });
    DOMS.questionList.appendChild(fragment);

    toggleClass(DOMS.generatePager, "hidden", true);
  }

  // #endregion =============== 试卷生成 ===============

  // #region =============== 导出功能 ===============

  // 导出按钮事件绑定
  DOMS.exportQuestionsPager.onclick = handleExport;

  /**
   * 处理试卷导出
   * 生成Word文档并下载试卷和答案
   */
  async function handleExport() {
    if (!generatedPaper || generatedPaper.list.length === 0) {
      return;
    }

    const label = (await getAllRoles()).find(
      (i) => i.id === DOMS.roleSelect.value
    )!.name;
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .slice(0, 15);

    const examDoc = buildDoc(
      `${label} 随机试卷（总分 ${generatedPaper.totalScore}）`,
      generatedPaper.list,
      false
    );
    const answerDoc = buildDoc(`${label} 参考答案`, generatedPaper.list, true);

    await downloadDoc(examDoc, `${label}-试卷-${timestamp}.docx`);
    await downloadDoc(answerDoc, `${label}-答案-${timestamp}.docx`);
  }

  // #endregion =============== 导出功能 ===============

  // #region =============== 初始化 ===============

  /**
   * 应用初始化
   * 加载角色数据并渲染界面
   */
  async function init() {
    const roles = await getAllRoles();
    rolesSelectorRender(roles);
  }

  // #endregion =============== 初始化 ===============

  init();
});
