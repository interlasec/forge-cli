import { AppConfigProvider, AppDeploymentStatus, Pause, UI, UserError, BaseError } from '@forge/cli-shared';
import { DeployMonitorClient } from './deploy-monitor-graphql-client';
import { TriggerDeployClient } from './trigger-deploy-graphql-client';
export declare class AppDeploymentFailedError extends BaseError {
    private readonly userError;
    constructor(userError?: boolean, requestId?: string | undefined, message?: string);
    isUserError(): boolean;
}
export declare class AppSnapshotFailedError extends BaseError {
    private readonly userError;
    constructor(userError?: boolean, requestId?: string | undefined, message?: string);
    isUserError(): boolean;
}
export declare class HostedResourceDeploymentFailedError extends BaseError {
    private readonly userError;
    constructor(userError?: boolean, requestId?: string | undefined, message?: string);
    isUserError(): boolean;
}
export declare class ManifestValidationFailedError extends UserError {
    constructor(requestId?: string | undefined, message?: string);
}
export interface Deployer {
    deploy(environmentKey: string, artifactUrl: string, hostedResourceUploadId?: string): Promise<void>;
}
export declare class ArtifactDeployer implements Deployer {
    private readonly getConfiguredApp;
    private readonly deployClient;
    private readonly deployMonitorClient;
    private readonly pause;
    private readonly ui;
    constructor(getConfiguredApp: AppConfigProvider, deployClient: TriggerDeployClient, deployMonitorClient: DeployMonitorClient, pause: Pause, ui: UI);
    deploy(environmentKey: string, artifactUrl: string, hostedResourceUploadId?: string): Promise<void>;
    private doDeploy;
    pollAndCheckEvents(appId: string, environmentKey: string, deploymentId: string, totalStreamed: number): Promise<{
        status: AppDeploymentStatus;
        totalStreamed: number;
    }>;
    private monitorDeployment;
    private extractAllEvents;
    private getDeploymentEventsHandler;
    private handleErrorEvent;
}
//# sourceMappingURL=deployer.d.ts.map