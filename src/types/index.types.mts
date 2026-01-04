export const QuestionTypeEnum = {
  SingleChoice: 1,
  MultipleChoice: 2,
  TrueFalse: 3,
  FillBlank: 4,
  ShortAnswer: 5,
} as const;

export type QuestionType =
  (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];

/** 题目类型(中文) */
export const QuestionTypeChineseName: Record<QuestionType, string> = {
  1: "单选题",
  2: "多选题",
  3: "判断题",
  4: "填空题",
  5: "简答题",
};

export const QuestionTypeOrder: QuestionType[] = [
  QuestionTypeEnum.SingleChoice,
  QuestionTypeEnum.MultipleChoice,
  QuestionTypeEnum.TrueFalse,
  QuestionTypeEnum.FillBlank,
  QuestionTypeEnum.ShortAnswer,
]

/** 问题信息 */
export interface QuestionInfo {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[];
  answer: string;
  score: number;
  difficulty: number;
}

export type RawQuestion = Omit<QuestionInfo, "id">;

export type QuestionByType = Record<QuestionType, QuestionInfo[]>;
export type QuestionBanks = Record<string, QuestionByType>;

// 角色信息类型
export interface RoleInfo {
  id: string; // 角色 ID（key）
  name: string; // 显示名称
}
// 角色信息记录
export interface RoleInfoRecord extends RoleInfo {
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
}
