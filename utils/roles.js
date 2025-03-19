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
}

module.exports = RolesManager;
