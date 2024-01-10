import { AppConfigProvider } from '@forge/cli-shared';
import { AppUninstallationInput } from '@forge/cli-shared';
import { Installation } from '../service/installation-service';
export interface UninstallAppOutput {
    product: string;
    site: string;
    environmentKey: string;
    successful?: boolean;
}
export interface AsyncAppUninstallationInput extends AppUninstallationInput {
    async: true;
}
export interface UninstallAppClient {
    getInstallation(appId: string, installationId: string): Promise<Installation>;
    uninstallApp(input: AsyncAppUninstallationInput): Promise<boolean>;
    uninstallMultipleApps(input: AsyncAppUninstallationInput[]): Promise<Partial<UninstallAppOutput>[]>;
}
export declare class UninstallAppCommand {
    private readonly getAppConfig;
    private readonly client;
    constructor(getAppConfig: AppConfigProvider, client: UninstallAppClient);
    execute(installationId: string): Promise<UninstallAppOutput>;
    batchExecute(installationIds?: string[], installationInfos?: Installation[]): Promise<UninstallAppOutput[]>;
}
//# sourceMappingURL=uninstall-app.d.ts.map