import { CachedConf } from '@forge/cli-shared';
export declare class CachedConfigService {
    private readonly cachedConf;
    constructor(cachedConf: CachedConf);
    getAnalyticsPreferences(): boolean | undefined;
    setAnalyticsPreferences(preference: boolean): void;
    private getDefaultEnvironments;
    getDefaultEnvironment(appId: string): string | undefined;
    setDefaultEnvironment(appId: string, preference: string): void;
    getNgrokConfigPath(): string | undefined;
    setNgrokConfigPath(preference: string): void;
}
//# sourceMappingURL=cached-config-service.d.ts.map