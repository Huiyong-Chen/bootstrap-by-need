const doms = {
  randomBtn: document.getElementById("randomBtn"),
  questionContainer: document.getElementById("questionContainer"),
};

// 题库：20道题目
const questionBank = [
  {
    question: "1 + 1 = ?",
    answer: "2",
  },
  {
    question: "2 + 2 = ?",
    answer: "4",
  },
  {
    question: "3 + 3 = ?",
    answer: "6",
  },
  {
    question: "4 + 4 = ?",
    answer: "8",
  },
  {
    question: "5 + 5 = ?",
    answer: "10",
  },
  {
    question: "6 + 6 = ?",
    answer: "12",
  },
  {
    question: "7 + 7 = ?",
    answer: "14",
  },
  {
    question: "8 + 8 = ?",
    answer: "16",
  },
  {
    question: "9 + 9 = ?",
    answer: "18",
  },
  {
    question: "10 + 10 = ?",
    answer: "20",
  },
  {
    question: "11 + 11 = ?",
    answer: "22",
  },
  {
    question: "12 + 12 = ?",
    answer: "24",
  },
  {
    question: "13 + 13 = ?",
    answer: "26",
  },
  {
    question: "14 + 14 = ?",
    answer: "28",
  },
  {
    question: "15 + 15 = ?",
    answer: "30",
  },
  {
    question: "16 + 16 = ?",
    answer: "32",
  },
  {
    question: "17 + 17 = ?",
    answer: "34",
  },
  {
    question: "18 + 18 = ?",
    answer: "36",
  },
  {
    question: "19 + 19 = ?",
    answer: "38",
  },
  {
    question: "20 + 20 = ?",
    answer: "40",
  },
];

// 随机生成题目按钮
doms.randomBtn.addEventListener("click", () => {
  // 每次随机生成5道题目
  const questions = randomQuestion(
    Math.max(5, Math.floor(Math.random() * questionBank.length))
  );
  renderQuestions(questions);
});

/**
 * 从题库中随机生成指定数量的题目
 * @param {number} count 要生成的题目数量
 * @returns {Array<{question: string, answer: string}>} 题目数组
 */
function randomQuestion(count) {
  // 如果请求的数量大于题库总数，返回所有题目
  if (count >= questionBank.length) {
    return shuffleArray([...questionBank]);
  }

  // 创建题库的副本并打乱顺序
  const shuffled = shuffleArray([...questionBank]);

  // 返回前count道题目
  return shuffled.slice(0, count);
}

/**
 * Fisher-Yates 洗牌算法：随机打乱数组
 * @param {Array} array 要打乱的数组
 * @returns {Array} 打乱后的新数组
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 将题目渲染到页面
 * @param {Array<{question: string, answer: string}>} questions 题目数组
 */
function renderQuestions(questions) {
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
