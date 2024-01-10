"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationKeysService = void 0;
class MigrationKeysService {
    constructor(migrationKeysClient, getAppConfig) {
        this.migrationKeysClient = migrationKeysClient;
        this.getAppConfig = getAppConfig;
    }
    async getMigrationKeysForAppEnvironment(environmentKey) {
        const { id: appId } = await this.getAppConfig();
        return await this.migrationKeysClient.getLatestMigrationKeys(appId, environmentKey);
    }
}
exports.MigrationKeysService = MigrationKeysService;
