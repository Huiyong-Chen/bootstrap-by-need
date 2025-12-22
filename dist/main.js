import { getAllRoles } from "./indexed-db/index.js";
import { renderRolesSelector } from "./scripts/render.js";
// 应用初始化
async function init() {
    const roles = await getAllRoles();
    renderRolesSelector(roles);
}
init();
