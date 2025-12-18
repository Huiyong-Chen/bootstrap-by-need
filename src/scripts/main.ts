import { questionBank } from "./data.js";
import { randomQuestion } from "./random-questions.js";
import { doms, renderQuestions } from "./render.js";

// 随机生成题目按钮
doms.randomBtn.addEventListener("click", () => {
  // 每次随机生成5道题目
  const questions = randomQuestion(
    Math.max(5, Math.floor(Math.random() * questionBank.length))
  );
  renderQuestions(questions);
});
