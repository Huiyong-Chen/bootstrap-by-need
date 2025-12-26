/**
 * 首页应用状态管理
 * 负责管理首页相关的状态和业务逻辑
 */

import { getAllRoles } from "../datas/roles.js";
import { QuestionByType, QuestionType, RoleInfoRecord } from "../types/index.types.js";

export class HomeAppState {
  questionBanks: QuestionByType | null = null
  questionRatioList: Partial<Record<QuestionType, number>> = {}
  generatedPaper: import("../datas/questions.js").GeneratedPaper | null = null
  private rolesCache: RoleInfoRecord[] | null = null
  private totalRatioCache: number = 0
  private updateTimeout: number | null = null

  updateQuestionRatio(type: QuestionType, ratio: number) {
    this.questionRatioList[type] = ratio
    this.debouncedUpdateTotalRatioDisplay()
  }

  private debouncedUpdateTotalRatioDisplay() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }
    this.updateTimeout = window.setTimeout(() => {
      this.updateTotalRatioDisplay()
    }, 100)
  }

  private updateTotalRatioDisplay() {
    const totalRatio = Object.values(this.questionRatioList).reduce((sum, ratio) => sum + ratio, 0)
    if (totalRatio !== this.totalRatioCache) {
      this.totalRatioCache = totalRatio
      // 这里需要访问 DOM，但我们应该让调用者来处理UI更新
      // 或者通过回调函数来处理
    }
  }

  hasValidRatios(): boolean {
    return Object.values(this.questionRatioList).some(ratio => ratio > 0)
  }

  resetQuestionRatios() {
    this.questionRatioList = {}
    this.totalRatioCache = 0
  }

  getTotalRatio(): number {
    return this.totalRatioCache
  }

  async getRoles(): Promise<RoleInfoRecord[]> {
    if (!this.rolesCache) {
      this.rolesCache = await getAllRoles()
    }
    return this.rolesCache
  }

  invalidateRolesCache() {
    this.rolesCache = null
  }

  // 计算总权重的方法，让外部调用者处理UI更新
  calculateTotalRatio(): number {
    return Object.values(this.questionRatioList).reduce((sum, ratio) => sum + ratio, 0)
  }
}
