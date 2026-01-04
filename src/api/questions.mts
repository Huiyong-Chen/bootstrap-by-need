import { getQuestionBankByRole } from '@/indexed-db/index.mts';
import {
  QuestionByType,
  QuestionInfo,
  QuestionType,
  QuestionTypeEnum,
  RawQuestion,
} from '@/types/index.types.mts';

export type RatioMap = Partial<Record<QuestionType, number>>;

export type GeneratedPaper = {
  list: QuestionInfo[];
  totalScore: number;
  shortfall?: number;
};

// 手动输入情况下转化问题格式
export function parseAndValidateQuestions(questionsStr: unknown) {
  try {
    let parsed: unknown;

    if (typeof questionsStr === 'string') {
      parsed = JSON.parse(questionsStr);
    } else if (Array.isArray(questionsStr)) {
      parsed = questionsStr;
    } else {
      return { success: false, error: '数据格式错误：必须是数组格式' };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, error: '题目列表不能为空' };
    }

    // 验证每个题目
    const normalizedQuestions: QuestionInfo[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i] as RawQuestion;
      // id 字段不需要提供，系统会自动生成
      if (!q.type) {
        return { success: false, error: `第 ${i + 1} 题缺少 type 字段` };
      }
      if (!q.title) {
        return { success: false, error: `第 ${i + 1} 题缺少 title 字段` };
      }
      if (!q.answer) {
        return { success: false, error: `第 ${i + 1} 题缺少 answer 字段` };
      }
      const type = toQuestionType(q.type);
      if (
        (type === QuestionTypeEnum.SingleChoice || type === QuestionTypeEnum.MultipleChoice) &&
        !q.options?.length
      ) {
        return { success: false, error: `第 ${i + 1} 题缺少 options 字段` };
      }
      if (typeof q.score !== 'number' || Number.isNaN(q.score) || q.score <= 0) {
        return {
          success: false,
          error: `第 ${i + 1} 题 score 必须是大于 0 的数字`,
        };
      }

      normalizedQuestions.push(normalizeQuestion(q, i));
    }

    return { success: true, questions: normalizedQuestions };
  } catch (error) {
    return {
      success: false,
      error: `解析失败：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

function normalizeQuestion(q: RawQuestion, index: number) {
  return {
    ...q,
    // 自动生成 id，用户不需要提供
    id: generateQuestionId(index),
    type: toQuestionType(q.type),
    title: q.title,
    answer: q.answer,
    score: q.score,
    difficulty: q.difficulty,
  };
}

// 生成唯一的题目 ID
// 使用时间戳 + 随机字符串 + 索引确保唯一性
function generateQuestionId(index: number) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `q_${timestamp}_${random}_${index}`;
}

function toQuestionType(type: string | number) {
  if (typeof type === 'number') {
    if (
      type === QuestionTypeEnum.SingleChoice ||
      type === QuestionTypeEnum.MultipleChoice ||
      type === QuestionTypeEnum.TrueFalse ||
      type === QuestionTypeEnum.FillBlank ||
      type === QuestionTypeEnum.ShortAnswer
    ) {
      return type;
    }
    return QuestionTypeEnum.SingleChoice;
  }

  // 尝试中文 label 映射
  switch (type.trim()) {
    case '单选题':
      return QuestionTypeEnum.SingleChoice;
    case '多选题':
      return QuestionTypeEnum.MultipleChoice;
    case '判断题':
      return QuestionTypeEnum.TrueFalse;
    case '填空题':
      return QuestionTypeEnum.FillBlank;
    case '简答题':
      return QuestionTypeEnum.ShortAnswer;
    default:
      return QuestionTypeEnum.SingleChoice;
  }
}

export function groupQuestionsByType(questions: QuestionInfo[]) {
  const grouped = {} as QuestionByType;

  questions.forEach((q) => {
    if (!grouped[q.type]) {
      grouped[q.type] = [];
    }
    grouped[q.type].push(q);
  });

  return grouped;
}

/**
 * 根据角色ID获取对应的题库
 * @param roleId 角色id
 */
export async function loadQuestionBanks(roleId: string) {
  const questionsByType = await getQuestionBankByRole(roleId);
  return questionsByType;
}

/**
 * 根据总分和权重随机生成试卷
 * @param bank 题库数据，按题型分组
 * @param ratios 各题型的权重配置
 * @param targetScore 目标总分
 * @returns 生成的试卷数据
 */
export function generatePaper(bank: QuestionByType, ratios: RatioMap, targetScore: number) {
  if (!bank) {
    return { list: [], totalScore: 0 };
  }

  // 初始化可用题目池
  const available = Object.fromEntries(
    (Object.entries(bank) as unknown as [QuestionType, QuestionInfo[]][]).map(([type, list]) => [
      type,
      [...list],
    ]),
  ) as Record<QuestionType, QuestionInfo[]>;

  const result: QuestionInfo[] = [];
  let total = 0;

  while (total < targetScore) {
    // 获取当前有权重且有题目的题型
    const availableTypes = Object.entries(ratios)
      .filter(([type, weight]) => weight > 0 && available[+type as QuestionType]?.length > 0)
      .map(([type]) => +type as QuestionType);

    if (availableTypes.length === 0) {
      // 没有更多可选择的题型
      break;
    }

    // 使用加权随机选择器从可用题型中选择
    const picker = buildWeightedPicker(
      Object.fromEntries(availableTypes.map((type) => [type, ratios[type] ?? 0])) as RatioMap,
    );

    const type = picker();
    if (!type) {
      break;
    }

    const pool = available[type];
    if (!pool || pool.length === 0) {
      // 该题型的题目已用完，从权重中移除
      ratios[type] = 0;
      continue;
    }

    // 选择题目
    const chosen = randomPick(pool);
    result.push(chosen);
    total += chosen.score;

    // 从可用池中移除已选择的题目
    available[type] = pool.filter((q) => q.id !== chosen.id);

    // 如果该题型题目已用完，从权重中移除
    if (available[type].length === 0) {
      ratios[type] = 0;
    }
  }

  return {
    list: result,
    totalScore: total,
    shortfall: Math.max(targetScore - total, 0) || undefined,
  };
}

function buildWeightedPicker(ratios: RatioMap) {
  const entries = Object.entries(ratios) as unknown as [QuestionType, number][];
  const totalWeight = entries.reduce((acc, [, weight]) => acc + weight, 0);

  return (): QuestionType | null => {
    if (entries.length === 0 || totalWeight <= 0) {
      return null;
    }
    let roll = Math.random() * totalWeight;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) {
        return type;
      }
    }
    return entries.at(-1)?.[0] ?? null;
  };
}

const randomPick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
