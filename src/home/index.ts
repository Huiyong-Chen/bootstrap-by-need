// import { getAllRoles } from "../indexed-db/index.js";
import { GeneratedPaper, generatePaper, loadQuestionBanks } from "../datas/questions.js";
import { getAllRoles } from "../datas/roles.js";
import { DOMS, emptyRoleDisplay, generatePagerDisplay, randomResultMessageDisplay, remainingScoreCtnDisplay, roleSelectorDisplay, weightConfigDisplay } from "../doms/home.js";
import { QuestionByType, QuestionInfo, QuestionType, QuestionTypeChineseName, QuestionTypeOrder, RoleInfoRecord } from "../types/index.types.js";
import { buildDoc, downloadDoc } from "../utils/docExporter.js";


window.addEventListener("DOMContentLoaded", () => {

  DOMS.roleSelect.onchange = roleSelectChange;
  DOMS.ratioList.onchange = () => {
    DOMS.randomBtn.disabled =
      !DOMS.ratioList.checkValidity() || !Object.values(questionRatioList).some(i => i > 0);
  };
  DOMS.randomBtn.onclick = generateQuestions
  DOMS.exportQuestionsPager.onclick = handleExport

  async function roleSelectChange() {
    const selectedRoleId = DOMS.roleSelect.value
    if (selectedRoleId) {
      const selectedRole = (await getAllRoles()).find(i => i.id === selectedRoleId)!
      setRoleBadgeText(selectedRole.name)
      weightConfigDisplay(false)
      // 根据所选岗位，匹配题目
      renderQuestionsRatioAndPreviewExport(selectedRoleId)
    } else {
      setRoleBadgeText("")
      weightConfigDisplay(true)
    }
  }
  // 人员选择器渲染
  function rolesSelectorRedner(roles: RoleInfoRecord[]) {
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
      roleSelectChange()

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

  // 当前角色题库
  let questionBanks: QuestionByType | null = null
  let questionRatioList: Partial<Record<QuestionType, number>> = {}
  // 根据所选角色，渲染题库权重
  async function renderQuestionsRatioAndPreviewExport(roleId: string) {
    questionBanks = await loadQuestionBanks(roleId)


    renderQuestionRatio()
  }

  function renderQuestionRatio() {
    if (!questionBanks) {
      return
    }

    const questionTypes = Object.keys(questionBanks)
    questionRatioList = {}

    const fragment = document.createDocumentFragment()

    questionTypes.forEach((type) => {
      const questionType = +type as QuestionType

      const typeItemEle = document.createElement("div")
      typeItemEle.classList.add("ratio-item")

      const typeItemInfoEle = document.createElement("div")
      typeItemInfoEle.classList.add("ratio-item-info")

      const typeLableEle = document.createElement("strong")
      typeLableEle.innerText = QuestionTypeChineseName[questionType]

      const totalQuestionLabel = document.createElement("span")
      totalQuestionLabel.innerText = `共 ${questionBanks![questionType].length} 题`

      const typeRatioEle = document.createElement("input") as HTMLInputElement

      typeRatioEle.classList.add('ratio-input')
      typeRatioEle.name = `questionType${questionType}`
      typeRatioEle.type = 'number'
      typeRatioEle.placeholder = '输入权重'
      typeRatioEle.min = '0';
      typeRatioEle.step = '1'
      typeRatioEle.value = '0'
      typeRatioEle.onchange = e => {
        questionRatioChange((e.target as HTMLInputElement).value, questionType)
      }

      typeItemInfoEle.appendChild(typeLableEle)
      typeItemInfoEle.appendChild(totalQuestionLabel)

      typeItemEle.appendChild(typeItemInfoEle)
      typeItemEle.appendChild(typeRatioEle)

      fragment.appendChild(typeItemEle)

    })
    DOMS.ratioList.appendChild(fragment)
  }

  function questionRatioChange(value: string | number, type: QuestionType) {
    questionRatioList[type] = +value

    DOMS.totalRatio.innerText = `总权重：${Object.values(questionRatioList).reduce((t, c) => t + c, 0)}`
  }

  let generatedPaper: GeneratedPaper | null = null

  function generateQuestions() {
    if (+DOMS.targetScore.value <= 0) {
      alert('请输入需要生成的总分数')
      return
    }

    generatedPaper = generatePaper(questionBanks!, questionRatioList, +DOMS.targetScore.value)

    const typePriority = (type: QuestionType) => {
      const idx = QuestionTypeOrder.indexOf(type)
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
    }

    const sortedList = [...generatedPaper.list].sort((a, b) => {
      const typeDiff = typePriority(a.type) - typePriority(b.type)
      if (typeDiff !== 0) return typeDiff
      return (a.difficulty ?? 0) - (b.difficulty ?? 0)
    })

    if (sortedList.length === 0) {
      alert('题库不足，未能生成试卷')
      return
    }
    if (generatedPaper.shortfall) {
      DOMS.randomResultMessage.innerText =
        `试题抽完，距离目标还差 ${generatedPaper.shortfall} 分`
      randomResultMessageDisplay(false)
    }
    renderQuestionPage(sortedList, generatedPaper.totalScore, generatedPaper.shortfall)
    alert('已生成试卷')

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


  async function handleExport() {
    if (!generatedPaper || generatedPaper.list.length === 0) {
      return
    }

    const label = (await getAllRoles()).find(i => i.id === DOMS.roleSelect.value)!.name
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .slice(0, 15)

    const examDoc = buildDoc(
      `${label} 随机试卷（总分 ${generatedPaper.totalScore}）`,
      generatedPaper.list,
      false,
    )
    const answerDoc = buildDoc(
      `${label} 参考答案`,
      generatedPaper.list,
      true,
    )

    await downloadDoc(examDoc, `${label}-试卷-${timestamp}.docx`)
    await downloadDoc(answerDoc, `${label}-答案-${timestamp}.docx`)
  }





  // 应用初始化
  async function init() {
    const roles = await getAllRoles();
    rolesSelectorRedner(roles);
  }

  init()
})
