export const doms = {
  randomBtn: document.getElementById("randomBtn"),
  questionContainer: document.getElementById("questionContainer"),
};

/**
 * 将题目渲染到页面
 * @param {Array<{question: string, answer: string}>} questions 题目数组
 */
export function renderQuestions(questions) {
    const ulEle = document.createElement("ul");
  
    questions.forEach((question) => {
      const questionEle = document.createElement("div");
      questionEle.innerHTML = `题目：${question.question}`;
  
      const answerEle = document.createElement("div");
      answerEle.innerHTML = `答案：${question.answer}`;
  
      const liEle = document.createElement("li");
      liEle.appendChild(questionEle);
      liEle.appendChild(answerEle);
  
      ulEle.appendChild(liEle);
    });
    // 清空原有题目
    doms.questionContainer.innerHTML = "";
    doms.questionContainer.appendChild(ulEle);
  }
