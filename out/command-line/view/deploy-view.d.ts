import { AppEnvironmentDetails, AppEnvironmentType, UI } from '@forge/cli-shared';
import { LintResult } from '@forge/lint';
import { DeploymentResult } from '../register-deployment-commands';
export declare class DeployView {
    private readonly ui;
    constructor(ui: UI);
    getLogger(): UI;
    displayStart(environment: string, environmentType: AppEnvironmentType): void;
    displayListAppInstallationsError(): void;
    displayLintRunning(): void;
    displayOutdatedInstallationsMessage(): void;
    displayIndexingCommand(environment: string): void;
    displayLintErrors(lintResults: LintResult[]): void;
    displayLintWarnings(warnings: number): void;
    displayNoLintProblems(): void;
    displayConnectKeyChangeWarning(environment: string, migrationKey: string, connectKey: string): void;
    displayConnectKeyDeleteWarning(environment: string): void;
    displayMPACAppConnectKeyChangeError(mpacAppKey: string, connectKey: string): void;
    displayEnvironmentCreationWarning(environment: string): void;
    displayEnvironmentCreationSuccessMessage(environment: string): void;
    promptToContinueDeletingConnectKey(): Promise<boolean>;
    promptToContinueChangingConnectKey(): Promise<boolean>;
    promptToCreateEnvironment(): Promise<boolean>;
    promptToContinueDeploymentWhileReindexing(): Promise<boolean>;
    displaySuccessfulDeploymentWhileReindexing(): void;
    reportDeploymentProgress({ appAri, name, environmentKey, environmentType }: AppEnvironmentDetails, showDistributionPageLink: boolean, deployCallback: () => Promise<DeploymentResult>): Promise<DeploymentResult>;
}
//# sourceMappingURL=deploy-view.d.ts.map