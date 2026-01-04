import { RoleInfo, RoleInfoRecord } from '@/types/index.types.mts';
import {
  ROLES_STORE,
  createTransaction,
  ensureRoleStoreExists,
  initDB,
  performDatabaseUpgrade,
  promisifyRequest,
} from './base.mts';

// #region ============= 角色管理 =============

/**
 * 获取所有角色信息
 * @returns 角色列表
 */
export async function queryAllRoles(): Promise<RoleInfoRecord[]> {
  const db = await initDB();
  try {
    const { stores } = createTransaction(db, [ROLES_STORE], 'readonly');
    const request = (stores as IDBObjectStore).getAll();
    const result = await promisifyRequest(request);
    return result || [];
  } finally {
    db.close();
  }
}

/**
 * 创建或更新角色信息
 * @param role 角色信息
 * @returns 保存的角色信息
 */
export async function saveRoleInfo(role: RoleInfo | RoleInfoRecord): Promise<RoleInfoRecord> {
  let db = await initDB();

  // 检查 objectStore 是否存在，如果不存在需要升级数据库
  if (!ensureRoleStoreExists(db, role.id)) {
    db.close();

    // 获取现有角色列表用于数据库升级
    let existingRoles: RoleInfoRecord[] = [];
    try {
      existingRoles = await queryAllRoles();
    } catch (error) {
      // 如果获取失败，继续执行
      console.warn('获取现有角色列表失败:', error);
    }

    // 执行数据库升级
    await performDatabaseUpgrade(role.id, existingRoles);

    // 重新打开数据库
    db = await initDB();

    // 再次检查，确保 objectStore 已创建
    if (!ensureRoleStoreExists(db, role.id)) {
      db.close();
      throw new Error('创建角色存储表失败，请重试');
    }
  }

  try {
    const { stores } = createTransaction(db, [ROLES_STORE], 'readwrite');

    const roleInfo: RoleInfoRecord = {
      ...role,
      createdAt: 'createdAt' in role ? role.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    const request = (stores as IDBObjectStore).put(roleInfo);
    await promisifyRequest(request);

    return roleInfo;
  } finally {
    db.close();
  }
}

/**
 * 获取单个角色信息
 * @param roleId 角色ID
 * @returns 角色信息或null
 */
export async function getRoleInfo(roleId: string): Promise<RoleInfo | null> {
  const db = await initDB();
  try {
    const { stores } = createTransaction(db, [ROLES_STORE], 'readonly');
    const request = (stores as IDBObjectStore).get(roleId);
    const result = await promisifyRequest(request);
    return result ?? null;
  } catch (error) {
    throw new Error(`读取角色信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    db.close();
  }
}

// #endregion
