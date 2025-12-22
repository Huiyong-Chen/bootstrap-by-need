const DB_NAME = "QuestionBankDB";
const DB_VERSION = 1; // 基础版本号
const ROLES_STORE = "roles";
// #region  ============= 数据库信息相关 =============
// 数据库升级锁，防止并发升级
let upgradeLock = null;
// 初始化数据库
function _initDB(version) {
    return new Promise((resolve, reject) => {
        // 如果没有指定版本，先获取当前版本
        const openRequest = indexedDB.open(DB_NAME);
        // 数据库初始化失败
        openRequest.onerror = () => {
            reject(new Error(`无法打开 IndexedDB: ${openRequest.error?.message || "未知错误"}`));
        };
        // 数据库初始化成功
        openRequest.onsuccess = () => {
            resolve(openRequest.result);
        };
        // 数据库升级
        openRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            // 创建角色表
            if (!db.objectStoreNames.contains(ROLES_STORE)) {
                const rolesStore = db.createObjectStore(ROLES_STORE, { keyPath: "id" });
                // 创建索引
                rolesStore.createIndex("name", "name", { unique: false });
            }
        };
    });
}
// 获取当前数据库版本
const getCurrentDBVersion = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);
        request.onsuccess = () => {
            const version = request.result.version;
            request.result.close();
            resolve(version || DB_VERSION);
        };
        request.onerror = () => {
            reject(new Error(`无法获取数据库版本: ${request.error?.message || "未知错误"}`));
        };
    });
};
// 确保角色的 objectStore 存在
function ensureRoleStoreExists(db, roleId) {
    const storeName = getRoleStoreName(roleId);
    return db.objectStoreNames.contains(storeName);
}
// 获取角色对应的 objectStore 名称
function getRoleStoreName(roleId) {
    return `role_${roleId}`;
}
// 升级数据库以创建新角色的 objectStore
async function upgradeDBForNewRole(roleId) {
    // 如果已有升级在进行，等待其完成
    if (upgradeLock) {
        await upgradeLock;
        // 升级完成后，再次检查 objectStore 是否已创建
        const db = await _initDB();
        if (ensureRoleStoreExists(db, roleId)) {
            db.close();
            return;
        }
        db.close();
    }
    // 创建新的升级锁
    upgradeLock = (async () => {
        try {
            // 在升级前，先读取所有已存在的角色（在版本变更事务外）
            let existingRoles = [];
            try {
                existingRoles = await queryAllRoles();
            }
            catch (error) {
                // 如果读取失败，可能是首次创建，继续执行
                console.warn("读取已有角色失败，继续创建新角色:", error);
            }
            // 获取当前版本并升级
            const currentVersion = await getCurrentDBVersion();
            const newVersion = currentVersion + 1;
            const storeName = getRoleStoreName(roleId);
            await new Promise((resolve, reject) => {
                // 设置超时，防止无限等待
                const timeout = setTimeout(() => {
                    reject(new Error("数据库升级超时，请重试"));
                }, 10000); // 10秒超时
                const upgradeRequest = indexedDB.open(DB_NAME, newVersion);
                upgradeRequest.onupgradeneeded = (event) => {
                    try {
                        const newDb = event.target.result;
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
                        existingRoles.forEach((role) => {
                            const roleStoreName = getRoleStoreName(role.id);
                            if (!newDb.objectStoreNames.contains(roleStoreName)) {
                                newDb.createObjectStore(roleStoreName);
                            }
                        });
                        // 创建新角色的 objectStore
                        if (!newDb.objectStoreNames.contains(storeName)) {
                            newDb.createObjectStore(storeName);
                        }
                    }
                    catch (error) {
                        clearTimeout(timeout);
                        reject(new Error(`数据库升级过程中出错: ${error instanceof Error ? error.message : "未知错误"}`));
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
                    }
                    else {
                        reject(new Error(`升级数据库失败: ${errorMsg}`));
                    }
                };
            });
        }
        finally {
            // 清除升级锁
            upgradeLock = null;
        }
    })();
    await upgradeLock;
}
// #endregion
// #region ============= 角色管理 =============
// 获取所有角色信息
export async function queryAllRoles() {
    const db = await _initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ROLES_STORE], "readonly");
        const store = transaction.objectStore(ROLES_STORE);
        const request = store.getAll();
        request.onerror = () => {
            db.close();
            reject(new Error(`读取角色列表失败: ${request.error?.message || "未知错误"}`));
        };
        request.onsuccess = () => {
            db.close();
            resolve(request.result || []);
        };
    });
}
// 创建或更新角色信息
export async function saveRoleInfo(role) {
    let db = await _initDB();
    // 检查 objectStore 是否存在，如果不存在需要升级数据库
    if (!ensureRoleStoreExists(db, role.id)) {
        db.close();
        // 升级数据库，以创建新角色的 objectStore
        await upgradeDBForNewRole(role.id);
        // 重新打开数据库
        db = await _initDB();
        // 再次检查，确保 objectStore 已创建
        if (!ensureRoleStoreExists(db, role.id)) {
            db.close();
            throw new Error("创建角色存储表失败，请重试");
        }
    }
    // 保存角色信息
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ROLES_STORE], "readwrite");
        const store = transaction.objectStore(ROLES_STORE);
        const roleInfo = {
            ...role,
            createdAt: "createdAt" in role ? role.createdAt : Date.now(),
            updatedAt: Date.now(),
        };
        const request = store.put(roleInfo);
        request.onsuccess = () => {
            db.close();
            resolve(roleInfo);
        };
        request.onerror = () => {
            db.close();
            reject(new Error(`保存角色信息失败: ${request.error?.message || "未知错误"}`));
        };
    });
}
// 获取角色信息
export const getRoleInfo = async (roleId) => {
    const db = await _initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ROLES_STORE], 'readonly');
        const store = transaction.objectStore(ROLES_STORE);
        const request = store.get(roleId);
        request.onsuccess = () => {
            db.close();
            resolve(request.result || null);
        };
        request.onerror = () => {
            db.close();
            reject(new Error(`读取角色信息失败: ${request.error?.message || '未知错误'}`));
        };
    });
};
// #endregion
// #region ============= 题目管理 =============
// 保存指定角色的题库
export async function saveQuestionBankByRole(roleId, bank) {
    let db = await _initDB();
    const storeName = getRoleStoreName(roleId);
    // 如果 objectStore 不存在，尝试创建（可能是角色已创建但 objectStore 未创建）
    if (!ensureRoleStoreExists(db, roleId)) {
        // 检查角色是否存在
        const roleInfo = await getRoleInfo(roleId);
        if (!roleInfo) {
            db.close();
            throw new Error(`角色 ${roleId} 不存在，请先创建角色`);
        }
        db.close();
        // 角色存在但 objectStore 不存在，需要升级数据库创建 objectStore
        await upgradeDBForNewRole(roleId);
        // 重新打开数据库
        db = await _initDB();
        // 再次检查，确保 objectStore 已创建
        if (!ensureRoleStoreExists(db, roleId)) {
            db.close();
            throw new Error(`创建角色存储表失败，请重试`);
        }
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(bank, 'data');
        request.onsuccess = () => {
            db.close();
            resolve();
        };
        request.onerror = () => {
            db.close();
            reject(new Error(`保存题库数据失败: ${request.error?.message || '未知错误'}`));
        };
    });
}
// 获取指定角色的题库
export async function getQuestionBankByRole(roleId) {
    const db = await _initDB();
    const storeName = getRoleStoreName(roleId);
    if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        return null;
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get('data');
        request.onsuccess = () => {
            const internalBank = request.result || {};
            db.close();
            resolve(Object.keys(internalBank).length > 0 ? internalBank : null);
        };
        request.onerror = () => {
            db.close();
            reject(new Error(`读取题库数据失败: ${request.error?.message || '未知错误'}`));
        };
    });
}
// #endregion
