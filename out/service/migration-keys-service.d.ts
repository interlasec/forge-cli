import { AppConfigProvider } from '@forge/cli-shared';
export declare type MigrationKeys = {
    jira?: string;
    confluence?: string;
};
export interface AppEnvironmentMigrationKeys {
    migrationKeys?: MigrationKeys | null;
    mpacAppKey?: string | null;
}
export interface GetMigrationKeysClient {
    getLatestMigrationKeys(appId: string, environmentKey: string): Promise<AppEnvironmentMigrationKeys>;
}
export declare class MigrationKeysService {
    private readonly migrationKeysClient;
    private readonly getAppConfig;
    constructor(migrationKeysClient: GetMigrationKeysClient, getAppConfig: AppConfigProvider);
    getMigrationKeysForAppEnvironment(environmentKey: string): Promise<AppEnvironmentMigrationKeys>;
}
//# sourceMappingURL=migration-keys-service.d.ts.map