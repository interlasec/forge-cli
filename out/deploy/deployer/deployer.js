"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactDeployer = exports.ManifestValidationFailedError = exports.HostedResourceDeploymentFailedError = exports.AppSnapshotFailedError = exports.AppDeploymentFailedError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const DEPLOYMENT_EVENT_POLL_INTERVAL = 500;
class AppDeploymentFailedError extends cli_shared_1.BaseError {
    constructor(userError = false, requestId, message) {
        super(requestId, `${message} (requestId: ${requestId || 'unknown'})`);
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
exports.AppDeploymentFailedError = AppDeploymentFailedError;
class AppSnapshotFailedError extends cli_shared_1.BaseError {
    constructor(userError = false, requestId, message) {
        super(requestId, message);
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
exports.AppSnapshotFailedError = AppSnapshotFailedError;
class HostedResourceDeploymentFailedError extends cli_shared_1.BaseError {
    constructor(userError = false, requestId, message) {
        super(requestId, message);
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
exports.HostedResourceDeploymentFailedError = HostedResourceDeploymentFailedError;
class ManifestValidationFailedError extends cli_shared_1.UserError {
    constructor(requestId, message) {
        super(`${message} (requestId: ${requestId || 'unknown'})`, requestId);
    }
}
exports.ManifestValidationFailedError = ManifestValidationFailedError;
function isTransitionEvent(event) {
    return event.__typename === 'AppDeploymentTransitionEvent';
}
function isSnapshotLogEvent(event) {
    return event.__typename === 'AppDeploymentSnapshotLogEvent';
}
function isValidSnapshotLogEvent(event) {
    return !!(event.message && event.level);
}
class ArtifactDeployer {
    constructor(getConfiguredApp, deployClient, deployMonitorClient, pause, ui) {
        this.getConfiguredApp = getConfiguredApp;
        this.deployClient = deployClient;
        this.deployMonitorClient = deployMonitorClient;
        this.pause = pause;
        this.ui = ui;
    }
    async deploy(environmentKey, artifactUrl, hostedResourceUploadId) {
        const { id } = await this.getConfiguredApp();
        const deploymentId = await this.doDeploy(id, environmentKey, artifactUrl, hostedResourceUploadId);
        await this.monitorDeployment(id, environmentKey, deploymentId);
    }
    async doDeploy(appId, environmentKey, artifactUrl, hostedResourceUploadId) {
        return await this.deployClient.deploy({
            appId,
            environmentKey,
            artifactUrl,
            hostedResourceUploadId
        });
    }
    async pollAndCheckEvents(appId, environmentKey, deploymentId, totalStreamed) {
        const { stages, status, errorDetails, requestId } = await this.deployMonitorClient.getDeployment({
            appId,
            environmentKey,
            deploymentId
        });
        const events = this.extractAllEvents(stages || []);
        const handleEvent = this.getDeploymentEventsHandler();
        if (events.length > totalStreamed) {
            for (let i = totalStreamed; i < events.length; i++) {
                handleEvent(events[i]);
            }
            totalStreamed = events.length;
        }
        if (status === cli_shared_1.AppDeploymentStatus.Failed) {
            this.handleErrorEvent(errorDetails, requestId);
        }
        return {
            status,
            totalStreamed
        };
    }
    async monitorDeployment(appId, environmentKey, deploymentId) {
        let totalStreamed = 0;
        let status = cli_shared_1.AppDeploymentStatus.InProgress;
        while (status !== cli_shared_1.AppDeploymentStatus.Done) {
            const checks = await this.pollAndCheckEvents(appId, environmentKey, deploymentId, totalStreamed);
            totalStreamed = checks.totalStreamed;
            status = checks.status;
            await this.pause(DEPLOYMENT_EVENT_POLL_INTERVAL);
        }
    }
    extractAllEvents(stages) {
        return (0, cli_shared_1.flatMap)(stages, (stage) => {
            const events = stage.events || [];
            let stageHasTransitionEvent = false;
            return events
                .filter((event) => {
                if (!isTransitionEvent(event)) {
                    return true;
                }
                if (stageHasTransitionEvent) {
                    return false;
                }
                stageHasTransitionEvent = true;
                return true;
            })
                .map((event) => (Object.assign(Object.assign({}, event), { stepName: stage.description })));
        });
    }
    getDeploymentEventsHandler() {
        let addNewLineBetweenTransitions = false;
        return (event) => {
            if (isTransitionEvent(event)) {
                if (event.newStatus === 'STARTED') {
                    if (addNewLineBetweenTransitions) {
                        this.ui.emptyLine();
                        addNewLineBetweenTransitions = false;
                    }
                    this.ui.info(cli_shared_1.Text.deploy.taskDeploy.serverStepStarted(event.stepName));
                }
            }
            else if (isSnapshotLogEvent(event)) {
                if (!addNewLineBetweenTransitions) {
                    this.ui.emptyLine();
                    addNewLineBetweenTransitions = true;
                }
                if (isValidSnapshotLogEvent(event)) {
                    this.ui.snapshotLog(event.message, event.level);
                }
            }
            else if (event.message) {
                this.ui.debug(event.message);
            }
        };
    }
    handleErrorEvent(errorDetails, requestId) {
        var _a;
        if (errorDetails) {
            const { code, message } = errorDetails;
            switch (code) {
                case 'APP_CODE_SNAPSHOT_FAILED': {
                    throw new AppSnapshotFailedError(true, requestId, cli_shared_1.Text.snapshot.error('App code snapshot error', message));
                }
                case 'APP_CODE_SNAPSHOT_TIMEOUT': {
                    throw new AppSnapshotFailedError(false, requestId, cli_shared_1.Text.snapshot.timeout);
                }
                case 'ENVIRONMENT_UPDATE_VALIDATION_FAILED': {
                    const causeMessage = (_a = errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.fields) === null || _a === void 0 ? void 0 : _a.validationResult.message.replace(/Upsert.*Details /, '');
                    if ((causeMessage === null || causeMessage === void 0 ? void 0 : causeMessage.startsWith('Invalid URL')) && causeMessage.includes('EGRESS')) {
                        throw new AppDeploymentFailedError(true, requestId, cli_shared_1.Text.deploy.egressURL.invalidURLError(causeMessage));
                    }
                    else if (causeMessage === null || causeMessage === void 0 ? void 0 : causeMessage.startsWith('Egress permission URL')) {
                        throw new AppDeploymentFailedError(true, requestId, cli_shared_1.Text.deploy.egressURL.tooManyURLCharactersError(causeMessage));
                    }
                    else if (causeMessage === null || causeMessage === void 0 ? void 0 : causeMessage.includes('permission URLs provided, exceeding')) {
                        throw new AppDeploymentFailedError(true, requestId, cli_shared_1.Text.deploy.egressURL.tooManyUrlsError(causeMessage));
                    }
                    break;
                }
                case 'HOSTED_RESOURCE_TOO_MANY_FILES':
                case 'HOSTED_RESOURCE_ZIP_TOO_BIG':
                case 'HOSTED_RESOURCE_FILE_PATH_REFERS_TO_PARENT':
                case 'HOSTED_RESOURCE_INVALID_EGRESS_PERMISSIONS':
                case 'HOSTED_RESOURCE_ICON_RESOURCE_MISSING': {
                    throw new HostedResourceDeploymentFailedError(true, requestId, cli_shared_1.Text.hostedResources.error(message));
                }
                case 'HOSTED_RESOURCE_FAILED_TO_FETCH':
                case 'HOSTED_RESOURCE_FAILED_TO_COPY':
                case 'HOSTED_RESOURCE_UPLOAD_ID_MISSING': {
                    throw new HostedResourceDeploymentFailedError(false, requestId, cli_shared_1.Text.hostedResources.error(message));
                }
                case 'HOSTED_RESOURCES_LAMBDA_TIMEOUT': {
                    throw new HostedResourceDeploymentFailedError(false, requestId, cli_shared_1.Text.hostedResources.error(cli_shared_1.Text.hostedResources.lambdaTimeout));
                }
                case 'ENTITY_VALIDATION_ERROR':
                case 'MANIFEST_VALIDATION_FAILED': {
                    if (errorDetails.fields) {
                        throw new ManifestValidationFailedError(requestId, cli_shared_1.Text.config.manifest.error(message, JSON.stringify(errorDetails.fields, null, 2)));
                    }
                    throw new ManifestValidationFailedError(requestId, cli_shared_1.Text.config.manifest.error(message));
                }
            }
        }
        throw new AppDeploymentFailedError(false, requestId, cli_shared_1.Text.deploy.taskDeploy.serverStepFailed);
    }
}
exports.ArtifactDeployer = ArtifactDeployer;
