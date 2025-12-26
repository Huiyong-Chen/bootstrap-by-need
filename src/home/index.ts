// import { getAllRoles } from "../indexed-db/index.js";
import { GeneratedPaper, generatePaper, loadQuestionBanks } from "../datas/questions.js";
import { getAllRoles } from "../datas/roles.js";
import { DOMS, emptyRoleDisplay, generatePagerDisplay, randomResultMessageDisplay, remainingScoreCtnDisplay, roleSelectorDisplay, weightConfigDisplay } from "../doms/home.js";
import { QuestionByType, QuestionInfo, QuestionType, QuestionTypeChineseName, QuestionTypeOrder, RoleInfoRecord } from "../types/index.types.js";
import { buildDoc, downloadDoc } from "../utils/docExporter.js";
import { showError, showSuccess } from "../utils/notification.js";
import { HomeAppState } from "../states/homeState.js";

// UI 更新工具函数
class HomeUIUpdater {
  static updateTotalRatioDisplay(totalRatio: number) {
    DOMS.totalRatio.innerText = `总权重：${totalRatio}`
  }

  static updateQuestionRatio(state: HomeAppState, type: QuestionType, ratio: number) {
    state.updateQuestionRatio(type, ratio)
    const totalRatio = state.calculateTotalRatio()
    this.updateTotalRatioDisplay(totalRatio)
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const appState = new HomeAppState()

  DOMS.roleSelect.onchange = () => handleRoleSelectChange(appState);
  DOMS.ratioList.onchange = () => {
    DOMS.randomBtn.disabled =
      !DOMS.ratioList.checkValidity() || !appState.hasValidRatios();
  };
  DOMS.randomBtn.onclick = () => generateQuestions(appState)
  DOMS.exportQuestionsPager.onclick = () => handleExport(appState)

  async function handleRoleSelectChange(state: HomeAppState) {
    const selectedRoleId = DOMS.roleSelect.value
    if (selectedRoleId) {
      const roles = await state.getRoles()
      const selectedRole = roles.find(i => i.id === selectedRoleId)!
      setRoleBadgeText(selectedRole.name)
      weightConfigDisplay(false)
      // 根据所选岗位，匹配题目
      renderQuestionsRatioAndPreviewExport(selectedRoleId, state)
    } else {
      setRoleBadgeText("")
      weightConfigDisplay(true)
    }
  }
  // 人员选择器渲染
  function rolesSelectorRender(roles: RoleInfoRecord[], state: HomeAppState) {
    if (roles.length) {
      const fragment = document.createDocumentFragment();
      for (const role of roles) {
        const optionEle = document.createElement("option") as HTMLOptionElement;
        (optionEle.value = role.id), (optionEle.innerText = role.name);

        fragment.appendChild(optionEle);
      }
      DOMS.roleSelect.appendChild(fragment);

      // 表单添加后，默认选中第一项
      DOMS.roleSelect.value = roles[0].id;
      handleRoleSelectChange(state)

      roleSelectorDisplay(false);
      emptyRoleDisplay(true);
    } else {
      emptyRoleDisplay(false);
      roleSelectorDisplay(true);
    }
  }

  function setRoleBadgeText(roleName: string) {
    DOMS.roleBadge.innerText = `当前岗位：${roleName}`;
  }

  // 根据所选角色，渲染题库权重
  async function renderQuestionsRatioAndPreviewExport(roleId: string, state: HomeAppState) {
    state.questionBanks = await loadQuestionBanks(roleId)
    renderQuestionRatio(state)
  }

  function renderQuestionRatio(state: HomeAppState) {
    if (!state.questionBanks) {
      return
    }

    const questionTypes = Object.keys(state.questionBanks)
    // 只保留现有题型的权重，移除不存在的题型权重
    const existingTypes = questionTypes.map(type => +type as QuestionType)
    Object.keys(state.questionRatioList).forEach(key => {
      const type = +key as QuestionType
      if (!existingTypes.includes(type)) {
        delete state.questionRatioList[type]
      }
    })

    const fragment = document.createDocumentFragment()

    questionTypes.forEach((type) => {
      const questionType = +type as QuestionType

      const typeItemEle = document.createElement("div")
      typeItemEle.classList.add("ratio-item")

      const typeItemInfoEle = document.createElement("div")
      typeItemInfoEle.classList.add("ratio-item-info")

      const typeLabelEle = document.createElement("strong")
      typeLabelEle.innerText = QuestionTypeChineseName[questionType]

      const totalQuestionsLabel = document.createElement("span")
      totalQuestionsLabel.innerText = `共 ${state.questionBanks![questionType].length} 题`

      const typeRatioEle = document.createElement("input") as HTMLInputElement

      typeRatioEle.classList.add('ratio-input')
      typeRatioEle.name = `questionType${questionType}`
      typeRatioEle.type = 'number'
      typeRatioEle.placeholder = '输入权重'
      typeRatioEle.min = '0';
      typeRatioEle.step = '1'
      typeRatioEle.value = (state.questionRatioList[questionType] || 0).toString()
      typeRatioEle.onchange = e => {
        HomeUIUpdater.updateQuestionRatio(state, questionType, +(e.target as HTMLInputElement).value)
      }

      typeItemInfoEle.appendChild(typeLabelEle)
      typeItemInfoEle.appendChild(totalQuestionsLabel)

      typeItemEle.appendChild(typeItemInfoEle)
      typeItemEle.appendChild(typeRatioEle)

      fragment.appendChild(typeItemEle)

    })
    DOMS.ratioList.appendChild(fragment)
  }


  function generateQuestions(state: HomeAppState) {
    if (+DOMS.targetScore.value <= 0) {
      showError('请输入需要生成的总分数')
      return
    }

    state.generatedPaper = generatePaper(state.questionBanks!, state.questionRatioList, +DOMS.targetScore.value)

    const typePriority = (type: QuestionType) => {
      const idx = QuestionTypeOrder.indexOf(type)
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
    }

    const sortedList = [...state.generatedPaper!.list].sort((a, b) => {
      const typeDiff = typePriority(a.type) - typePriority(b.type)
      if (typeDiff !== 0) return typeDiff
      return (a.difficulty ?? 0) - (b.difficulty ?? 0)
    })

    if (sortedList.length === 0) {
      showError('题库不足，未能生成试卷')
      return
    }
    if (state.generatedPaper!.shortfall) {
      DOMS.randomResultMessage.innerText =
        `试题抽完，距离目标还差 ${state.generatedPaper!.shortfall} 分`
      randomResultMessageDisplay(false)
    }
    renderQuestionPage(sortedList, state.generatedPaper!.totalScore, state.generatedPaper!.shortfall)
    showSuccess('已生成试卷')

  }

  function renderQuestionPage(questions: QuestionInfo[], totalScore: number, remainingScore?: number) {
    DOMS.questionCount.innerText = `${questions.length}`
    DOMS.totalScore.innerText = `${totalScore}`
    DOMS.remainingScore.innerText = `${remainingScore ?? 0}`
    remainingScoreCtnDisplay(!remainingScore)

    const fragment = document.createDocumentFragment()
    // 题目渲染
    questions.forEach((q, index) => {
      const cardEle = document.createElement("div")
      cardEle.classList.add('question-card')

      const titleEle = document.createElement('div')
      titleEle.classList.add('question-title')
      titleEle.innerText = `${index + 1}. [${QuestionTypeChineseName[q.type]}] ${q.title} (${q.score}分)`

      cardEle.appendChild(titleEle)
      if (q.options) {
        const optionsUlEle = document.createElement("ul");
        optionsUlEle.classList.add('options-list')

        for (const opt of q.options) {
          const optionLiEle = document.createElement('li')
          optionLiEle.classList.add('option-item')

          const optionBadgeEle = document.createElement('span')
          optionBadgeEle.classList.add('option-badge')
          optionBadgeEle.innerText = String.fromCharCode(65 + index)

          const optionTextEle = document.createElement('span')
          optionTextEle.classList.add('option-text')
          optionTextEle.innerText = opt

          optionLiEle.appendChild(optionBadgeEle)
          optionLiEle.appendChild(optionTextEle)

          optionsUlEle.appendChild(optionLiEle)

        }
        cardEle.appendChild(optionsUlEle)
      }

      const metaEle = document.createElement('div');
      metaEle.classList.add('question-meta')

      const difficultyEle = document.createElement('span');
      difficultyEle.classList.add('meta-item')
      difficultyEle.innerText = `难度：${q.difficulty ?? 1}`

      const answerEle = document.createElement('span');
      answerEle.classList.add('meta-item', 'answer')
      answerEle.innerText = `答案：${q.answer}`

      metaEle.appendChild(difficultyEle)
      metaEle.appendChild(answerEle)

      cardEle.appendChild(metaEle)

      fragment.appendChild(cardEle)

    })
    DOMS.questionList.appendChild(fragment)

    // questionList

    generatePagerDisplay(false)
  }


  async function handleExport(state: HomeAppState) {
    if (!state.generatedPaper || state.generatedPaper.list.length === 0) {
      return
    }

    const roles = await state.getRoles()
    const label = roles.find(i => i.id === DOMS.roleSelect.value)!.name
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .slice(0, 15)

    const examDoc = buildDoc(
      `${label} 随机试卷（总分 ${state.generatedPaper.totalScore}）`,
      state.generatedPaper.list,
      false,
    )
    const answerDoc = buildDoc(
      `${label} 参考答案`,
      state.generatedPaper.list,
      true,
    )

    await downloadDoc(examDoc, `${label}-试卷-${timestamp}.docx`)
    await downloadDoc(answerDoc, `${label}-答案-${timestamp}.docx`)
  }





  // 应用初始化
  async function init(state: HomeAppState) {
    const roles = await state.getRoles();
    rolesSelectorRender(roles, state);
  }

  init(appState)
})
