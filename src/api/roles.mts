import { eventListener } from '@/events/index.mts';
import { queryAllRoles, saveRoleInfo } from '@/indexed-db/index.mts';
import { RoleInfo, RoleInfoRecord } from '@/types/index.types.mts';

let _roles: RoleInfoRecord[] = [];

let _initialized = false;

/** 获取全部角色 */
export async function getAllRoles() {
  if (!_initialized) {
    _roles = await queryAllRoles();
    _initialized = true;
  }
  return _roles;
}

// 添加角色
export async function addRole(role: RoleInfo) {
  try {
    const result = await saveRoleInfo(role);
    _roles.push(result);
    eventListener.emit('role:add', result);
  } catch (error) {
    console.error('Failed to add role:', error);
  }
}
