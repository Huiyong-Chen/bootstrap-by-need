// 数据库配置常量
export const DB_NAME = "QuestionBankDB";
export const DB_VERSION = 1;
export const ROLES_STORE = "roles";

// 数据库升级锁，防止并发升级
let upgradeLock: Promise<void> | null = null;

/**
 * 获取角色对应的 objectStore 名称
 * @param roleId 角色ID
 * @returns objectStore名称
 */
export function getRoleStoreName(roleId: string): string {
  return `role_${roleId}`;
}

/**
 * 初始化数据库连接
 * @param version 可选的数据库版本
 * @returns 数据库实例
 */
export function initDB(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DB_NAME, version);

    // 数据库初始化失败
    openRequest.onerror = () => {
      reject(
        new Error(
          `无法打开 IndexedDB: ${openRequest.error?.message || "未知错误"}`
        )
      );
    };

    // 数据库初始化成功
    openRequest.onsuccess = () => {
      resolve(openRequest.result);
    };

    // 数据库升级
    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建角色表
      if (!db.objectStoreNames.contains(ROLES_STORE)) {
        const rolesStore = db.createObjectStore(ROLES_STORE, { keyPath: "id" });
        // 创建索引
        rolesStore.createIndex("name", "name", { unique: false });
      }
    };
  });
}

/**
 * 获取当前数据库版本
 * @returns 数据库版本号
 */
export function getCurrentDBVersion(): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => {
      const version = request.result.version;
      request.result.close();
      resolve(version || DB_VERSION);
    };
    request.onerror = () => {
      reject(
        new Error(`无法获取数据库版本: ${request.error?.message || "未知错误"}`)
      );
    };
  });
}

/**
 * 检查角色的 objectStore 是否存在
 * @param db 数据库实例
 * @param roleId 角色ID
 * @returns 是否存在
 */
export function ensureRoleStoreExists(db: IDBDatabase, roleId: string): boolean {
  const storeName = getRoleStoreName(roleId);
  return db.objectStoreNames.contains(storeName);
}

/**
 * 执行数据库升级以创建新角色的 objectStore
 * @param roleId 角色ID
 * @param existingRoles 已存在的角色列表
 */
export async function performDatabaseUpgrade(roleId: string, existingRoles: any[]): Promise<void> {
  // 如果已有升级在进行，等待其完成
  if (upgradeLock) {
    await upgradeLock;

    // 升级完成后，再次检查 objectStore 是否已创建
    const db = await initDB();
    if (ensureRoleStoreExists(db, roleId)) {
      db.close();
      return;
    }
    db.close();
  }

  // 创建新的升级锁
  upgradeLock = (async () => {
    try {
      // 获取当前版本并升级
      const currentVersion = await getCurrentDBVersion();
      const newVersion = currentVersion + 1;
      const storeName = getRoleStoreName(roleId);

      await new Promise<void>((resolve, reject) => {
        // 设置超时，防止无限等待
        const timeout = setTimeout(() => {
          reject(new Error("数据库升级超时，请重试"));
        }, 10000); // 10秒超时

        const upgradeRequest = indexedDB.open(DB_NAME, newVersion);

        upgradeRequest.onupgradeneeded = (event) => {
          try {
            const newDb = (event.target as IDBOpenDBRequest).result;

            // 确保 roles store 存在
            if (!newDb.objectStoreNames.contains(ROLES_STORE)) {
              const rolesStore = newDb.createObjectStore(ROLES_STORE, {
                keyPath: "id",
              });
              rolesStore.createIndex("name", "name", {
                unique: false,
              });
            }

            // 为所有已存在的角色创建 objectStore（防止遗漏）
            existingRoles.forEach((role: any) => {
              const roleStoreName = getRoleStoreName(role.id);
              if (!newDb.objectStoreNames.contains(roleStoreName)) {
                newDb.createObjectStore(roleStoreName);
              }
            });

            // 创建新角色的 objectStore
            if (!newDb.objectStoreNames.contains(storeName)) {
              newDb.createObjectStore(storeName);
            }
          } catch (error) {
            clearTimeout(timeout);
            reject(
              new Error(
                `数据库升级过程中出错: ${error instanceof Error ? error.message : "未知错误"}`
              )
            );
          }
        };

        upgradeRequest.onsuccess = () => {
          clearTimeout(timeout);
          upgradeRequest.result.close();
          resolve();
        };

        upgradeRequest.onerror = () => {
          clearTimeout(timeout);
          const errorMsg = upgradeRequest.error?.message || "未知错误";
          // 检查是否是版本冲突错误
          if (errorMsg.includes("version") || errorMsg.includes("版本")) {
            reject(new Error(`数据库版本冲突，请刷新页面后重试: ${errorMsg}`));
          } else {
            reject(new Error(`升级数据库失败: ${errorMsg}`));
          }
        };
      });
    } finally {
      // 清除升级锁
      upgradeLock = null;
    }
  })();

  await upgradeLock;
}

/**
 * 创建数据库事务和存储对象
 * @param db 数据库实例
 * @param storeNames 存储对象名称数组
 * @param mode 事务模式
 * @returns 事务和存储对象
 */
export function createTransaction(
  db: IDBDatabase,
  storeNames: string[],
  mode: IDBTransactionMode = "readonly"
) {
  const transaction = db.transaction(storeNames, mode);
  const stores = storeNames.map(name => transaction.objectStore(name));
  return { transaction, stores: stores.length === 1 ? stores[0] : stores };
}

/**
 * 包装 IndexedDB 请求为 Promise
 * @param request IndexedDB 请求对象
 * @returns Promise
 */
export function promisifyRequest<T = any>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
