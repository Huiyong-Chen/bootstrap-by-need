export const QuestionTypeEnum = {
    SingleChoice: 1,
    MultipleChoice: 2,
    TrueFalse: 3,
    FillBlank: 4,
    ShortAnswer: 5,
};
/** 题目类型(中文) */
export const QuestionTypeChineseName = {
    1: "单选题",
    2: "多选题",
    3: "判断题",
    4: "填空题",
    5: "简答题",
};
export const QuestionTypeOrder = [
    QuestionTypeEnum.SingleChoice,
    QuestionTypeEnum.MultipleChoice,
    QuestionTypeEnum.TrueFalse,
    QuestionTypeEnum.FillBlank,
    QuestionTypeEnum.ShortAnswer,
];
