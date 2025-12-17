import { questionBank } from "./data.js";
/**
 * 从题库中随机生成指定数量的题目
 * @param {number} count 要生成的题目数量
 * @returns {Array<{question: string, answer: string}>} 题目数组
 */
export function randomQuestion(count) {
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
