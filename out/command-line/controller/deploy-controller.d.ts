import { AppConfigProvider, AppEnvironmentClient, ConfigFile, ErrorAnalytics, HiddenError } from '@forge/cli-shared';
import { LintService } from '../../service/lint-service';
import { DeployView } from '../view/deploy-view';
import { InstallationService } from '../../service/installation-service';
import { MigrationKeysService } from '../../service/migration-keys-service';
import { PackageUploadDeployCommand } from '../../deploy';
import { DeploymentResult } from '../register-deployment-commands';
import { CreateEnvironmentCommand } from '../../environment/create-environment';
import { CustomEntitiesService } from '../../service/custom-entities-service';
interface DeployOptions {
    environment: string;
    verify: boolean;
    nonInteractive?: boolean;
}
export declare class DeployLintFailureError extends HiddenError {
    private readonly scopes;
    constructor(scopes: string[]);
    getAttributes(): ErrorAnalytics;
    isUserError(): boolean;
}
export declare class InvalidConnectKeyError extends HiddenError {
    private readonly reason;
    constructor(reason: string);
    getAttributes(): ErrorAnalytics;
    isUserError(): boolean;
}
export declare class DeployController {
    private readonly appConfigProvider;
    private readonly configFile;
    private readonly lintService;
    private readonly installationsService;
    private readonly migrationKeysService;
    private readonly customEntitiesService;
    private readonly appEnvironmentClient;
    private readonly deployView;
    private readonly sandboxPackageUploadDeployCommand;
    private readonly nodePackageUploadDeployCommand;
    private readonly createEnvironmentCommand;
    constructor(appConfigProvider: AppConfigProvider, configFile: ConfigFile, lintService: LintService, installationsService: InstallationService, migrationKeysService: MigrationKeysService, customEntitiesService: CustomEntitiesService, appEnvironmentClient: AppEnvironmentClient, deployView: DeployView, sandboxPackageUploadDeployCommand: PackageUploadDeployCommand, nodePackageUploadDeployCommand: PackageUploadDeployCommand, createEnvironmentCommand: CreateEnvironmentCommand);
    private isMpacProductionApp;
    private connectKeyDeleted;
    private connectKeyChanged;
    private validateConnectKeyChange;
    private verifyPreDeployment;
    private verifyPostDeployment;
    private confirmAndCreateEnvironment;
    private getAppEnvironmentDetails;
    run({ environment, verify, nonInteractive }: DeployOptions): Promise<DeploymentResult | void>;
}
export {};
//# sourceMappingURL=deploy-controller.d.ts.map