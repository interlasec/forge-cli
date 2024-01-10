import { AppConfigProvider, CredentialStore, GetAppOwnerQuery, LoginCommand, UI } from '@forge/cli-shared';
import { CreateEnvironmentCommand } from '../../environment/create-environment';
import { ListEnvironmentCommand } from '../../environment/list-environment';
import { CachedConfigService } from '../../service/cached-config-service';
export declare class DefaultEnvironmentNotSetError extends Error {
    constructor();
}
export declare class DefaultEnvironmentController {
    private ui;
    private readonly credentialStore;
    private readonly cachedConfigService;
    private readonly getAppConfig;
    private readonly loginCommand;
    private readonly createEnvironmentCommand;
    private readonly listEnvironmentCommand;
    private readonly getAppOwnerQuery;
    constructor(ui: UI, credentialStore: CredentialStore, cachedConfigService: CachedConfigService, getAppConfig: AppConfigProvider, loginCommand: LoginCommand, createEnvironmentCommand: CreateEnvironmentCommand, listEnvironmentCommand: ListEnvironmentCommand, getAppOwnerQuery: GetAppOwnerQuery);
    run(nonInteractive?: boolean): Promise<string>;
    getDefaultEnvironment(): Promise<string | undefined>;
    private promptAndSetDefaultEnvironmentForContributor;
    private promptAndSetDefaultEnvironment;
    private environmentExists;
    private setExistingEnvironmentAsDefault;
    private createAndSetDefaultEnvironment;
    private setDefaultEnvironment;
}
//# sourceMappingURL=default-environment-controller.d.ts.map