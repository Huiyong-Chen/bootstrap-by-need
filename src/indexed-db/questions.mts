import {
  QuestionByType,
  QuestionInfo,
  QuestionType,
} from "@/types/index.types.mts";
import {
  createTransaction,
  getRoleStoreName,
  initDB,
  promisifyRequest,
} from "./base.mts";

// #region ============= 题目管理 =============

/**
 * 保存指定角色的题库
 * @param roleId 角色ID
 * @param bank 题库数据，按题型分组
 * @param append 是否追加到现有题库，默认为false（覆盖）
 */
export async function saveQuestionBankByRole(
  roleId: string,
  bank: QuestionByType,
  append: boolean = false
): Promise<void> {
  const db = await initDB();

  try {
    // 检查角色是否存在
    const storeName = getRoleStoreName(roleId);
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`角色 ${roleId} 不存在，请先创建角色`);
    }

    // 如果是追加模式，需要先获取现有数据并合并
    let finalBank = bank;
    if (append) {
      try {
        const existingBank = await getQuestionBankByRole(roleId);
        if (existingBank) {
          finalBank = { ...existingBank };

          // 合并每个题型的题目
          for (const [questionType, questions] of Object.entries(
            bank
          ) as unknown as [QuestionType, QuestionInfo[]][]) {
            if (finalBank[questionType]) {
              // 如果题型已存在，追加题目
              finalBank[questionType] = [
                ...finalBank[questionType],
                ...questions,
              ];
            } else {
              // 如果题型不存在，直接使用新数据
              finalBank[questionType] = [...questions];
            }
          }
        }
      } catch (error) {
        // 如果获取现有数据失败，继续使用新数据
        console.warn("获取现有题库数据失败，将使用覆盖模式:", error);
      }
    }

    const { stores } = createTransaction(db, [storeName], "readwrite");
    const request = (stores as IDBObjectStore).put(finalBank, "data");
    await promisifyRequest(request);
  } finally {
    db.close();
  }
}

/**
 * 获取指定角色的题库
 * @param roleId 角色ID
 * @returns 题库数据或null
 */
export async function getQuestionBankByRole(
  roleId: string
): Promise<QuestionByType | null> {
  const db = await initDB();

  try {
    const storeName = getRoleStoreName(roleId);

    if (!db.objectStoreNames.contains(storeName)) {
      return null;
    }

    const { stores } = createTransaction(db, [storeName], "readonly");
    const request = (stores as IDBObjectStore).get("data");
    const result = await promisifyRequest(request);

    const internalBank: QuestionByType = result || {};
    return Object.keys(internalBank).length > 0 ? internalBank : null;
  } finally {
    db.close();
  }
}

// #endregion
