import { eventListener } from "../events/index.js";
import { queryAllRoles, saveRoleInfo } from "../indexed-db/index.js";
let _roles = [];
let _inited = false;
/** 获取全部角色 */
export async function getAllRoles() {
    if (!_inited) {
        _roles = await queryAllRoles();
        _inited = true;
    }
    return _roles;
}
// 添加角色
export async function addRole(role) {
    try {
        const result = await saveRoleInfo(role);
        _roles.push(result);
        eventListener.emit("role:add", result);
    }
    catch (error) { }
}
