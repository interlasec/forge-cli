import { AppConfigProvider, AppEnvironment } from '@forge/cli-shared';
export interface ListEnvironmentDetails {
    appId: string;
}
export interface ListEnvironmentOutput extends Pick<AppEnvironment, 'key' | 'type'> {
    lastDeployedAt: string;
}
export interface ListEnvironmentClient {
    listEnvironment(details: ListEnvironmentDetails): Promise<ListEnvironmentOutput[]>;
}
export declare class ListEnvironmentCommand {
    private readonly client;
    private readonly getAppConfig;
    constructor(client: ListEnvironmentClient, getAppConfig: AppConfigProvider);
    execute(): Promise<ListEnvironmentOutput[]>;
}
//# sourceMappingURL=list-environment.d.ts.map