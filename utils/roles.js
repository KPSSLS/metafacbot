class RolesManager {
    constructor() {
        this.roles = new Map();
    }

    setRole(faction, roleId) {
        this.roles.set(faction, roleId);
    }

    getRole(faction) {
        return this.roles.get(faction);
    }

    getAllRoles() {
        return this.roles;
    }

    // Загрузка ролей из объекта
    loadFromObject(rolesObject) {
        if (rolesObject) {
            this.roles = new Map(Object.entries(rolesObject));
        }
    }

    // Преобразование ролей в объект для сохранения
    toObject() {
        return Object.fromEntries(this.roles);
    }
}

module.exports = RolesManager;
