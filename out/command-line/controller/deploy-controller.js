"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployController = exports.InvalidConnectKeyError = exports.DeployLintFailureError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const errors_1 = require("../errors");
class DeployLintFailureError extends cli_shared_1.HiddenError {
    constructor(scopes) {
        super();
        this.scopes = scopes;
    }
    getAttributes() {
        return Object.assign(Object.assign({}, super.getAttributes()), { scopes: this.scopes });
    }
    isUserError() {
        return true;
    }
}
exports.DeployLintFailureError = DeployLintFailureError;
class InvalidConnectKeyError extends cli_shared_1.HiddenError {
    constructor(reason) {
        super();
        this.reason = reason;
    }
    getAttributes() {
        return Object.assign(Object.assign({}, super.getAttributes()), { reason: this.reason });
    }
    isUserError() {
        return true;
    }
}
exports.InvalidConnectKeyError = InvalidConnectKeyError;
class DeployController {
    constructor(appConfigProvider, configFile, lintService, installationsService, migrationKeysService, customEntitiesService, appEnvironmentClient, deployView, sandboxPackageUploadDeployCommand, nodePackageUploadDeployCommand, createEnvironmentCommand) {
        this.appConfigProvider = appConfigProvider;
        this.configFile = configFile;
        this.lintService = lintService;
        this.installationsService = installationsService;
        this.migrationKeysService = migrationKeysService;
        this.customEntitiesService = customEntitiesService;
        this.appEnvironmentClient = appEnvironmentClient;
        this.deployView = deployView;
        this.sandboxPackageUploadDeployCommand = sandboxPackageUploadDeployCommand;
        this.nodePackageUploadDeployCommand = nodePackageUploadDeployCommand;
        this.createEnvironmentCommand = createEnvironmentCommand;
    }
    isMpacProductionApp(mpacAppKey, environment) {
        return !!(mpacAppKey && environment === 'production');
    }
    connectKeyDeleted(connectKey, comparisonKey) {
        return !!(!connectKey && comparisonKey);
    }
    connectKeyChanged(connectKey, comparisonKey) {
        return !!(comparisonKey && connectKey && connectKey !== comparisonKey);
    }
    async validateConnectKeyChange(environment, keys) {
        const { migrationKeys, mpacAppKey } = keys;
        const connectKey = await this.configFile.getConnectKey();
        const migrationKey = (migrationKeys === null || migrationKeys === void 0 ? void 0 : migrationKeys.confluence) || (migrationKeys === null || migrationKeys === void 0 ? void 0 : migrationKeys.jira);
        const isMpacApp = this.isMpacProductionApp(mpacAppKey, environment);
        if (this.connectKeyDeleted(connectKey, migrationKey)) {
            this.deployView.displayConnectKeyDeleteWarning(environment);
            const proceed = await this.deployView.promptToContinueDeletingConnectKey();
            return { proceed, connectKeyDeleted: proceed, connectKeyChanged: false };
        }
        else if (isMpacApp && this.connectKeyChanged(connectKey, mpacAppKey)) {
            this.deployView.displayMPACAppConnectKeyChangeError(mpacAppKey, connectKey);
            throw new InvalidConnectKeyError(cli_shared_1.Text.deploy.connectKeyChange.mpacAppConnectKeyChangeAnalyticsError);
        }
        else if (!isMpacApp && this.connectKeyChanged(connectKey, migrationKey)) {
            this.deployView.displayConnectKeyChangeWarning(environment, migrationKey, connectKey);
            const proceed = await this.deployView.promptToContinueChangingConnectKey();
            return { proceed, connectKeyChanged: proceed, connectKeyDeleted: false };
        }
        return { proceed: true, connectKeyChanged: false, connectKeyDeleted: false };
    }
    async verifyPreDeployment(environment) {
        var _a, _b;
        this.deployView.displayLintRunning();
        const { lintResults } = await this.lintService.run(environment, { fix: false }, this.deployView.getLogger());
        const problemCount = this.lintService.problemCount(lintResults);
        if (problemCount.errors) {
            this.deployView.displayLintErrors(lintResults);
            const failures = this.lintService.failedScopes(lintResults);
            throw new DeployLintFailureError(failures);
        }
        else if (problemCount.warnings) {
            this.deployView.displayLintWarnings(problemCount.warnings);
        }
        else {
            this.deployView.displayNoLintProblems();
        }
        const manifest = await this.configFile.readConfig();
        if ((_b = (_a = manifest === null || manifest === void 0 ? void 0 : manifest.app) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.entities) {
            if (await this.customEntitiesService.isReindexingInProgress(environment)) {
                if (!(await this.deployView.promptToContinueDeploymentWhileReindexing())) {
                    throw new errors_1.UserAbortError();
                }
            }
        }
    }
    async verifyPostDeployment(environment) {
        var _a, _b;
        const needsVersionUpdate = await this.installationsService.hasOutdatedProductInstallation(environment);
        if (needsVersionUpdate) {
            this.deployView.displayOutdatedInstallationsMessage();
        }
        const manifest = await this.configFile.readConfig();
        if ((_b = (_a = manifest === null || manifest === void 0 ? void 0 : manifest.app) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.entities) {
            if (await this.customEntitiesService.isReindexingInProgress(environment)) {
                this.deployView.displaySuccessfulDeploymentWhileReindexing();
            }
            this.deployView.displayIndexingCommand(environment);
        }
    }
    async confirmAndCreateEnvironment(environment, nonInteractive) {
        if (!nonInteractive) {
            this.deployView.displayEnvironmentCreationWarning(environment);
            const confirm = await this.deployView.promptToCreateEnvironment();
            if (!confirm) {
                throw new errors_1.UserAbortError();
            }
        }
        await this.createEnvironmentCommand.execute({ environmentKey: environment });
        this.deployView.displayEnvironmentCreationSuccessMessage(environment);
    }
    async getAppEnvironmentDetails(id, environment, nonInteractive) {
        try {
            return await this.appEnvironmentClient.getAppEnvironmentDetails(id, environment);
        }
        catch (e) {
            if (!(e instanceof cli_shared_1.MissingAppEnvironmentError)) {
                throw e;
            }
            await this.confirmAndCreateEnvironment(environment, nonInteractive);
            return this.appEnvironmentClient.getAppEnvironmentDetails(id, environment);
        }
    }
    async run({ environment, verify, nonInteractive }) {
        var _a;
        const { id } = await this.appConfigProvider();
        const appDetails = await this.getAppEnvironmentDetails(id, environment, nonInteractive);
        this.deployView.displayStart(environment, appDetails.environmentType);
        let hasConnectKeyChanged = false;
        let hasConnectKeyDeleted = false;
        if (verify) {
            await this.verifyPreDeployment(environment);
            const keys = await this.migrationKeysService.getMigrationKeysForAppEnvironment(environment);
            const { proceed, connectKeyChanged, connectKeyDeleted } = await this.validateConnectKeyChange(environment, keys);
            if (!proceed) {
                return;
            }
            hasConnectKeyChanged = connectKeyChanged;
            hasConnectKeyDeleted = connectKeyDeleted;
        }
        const handlers = await this.configFile.getAppHandlers();
        const resources = await this.configFile.getResources();
        let hasProdInstallations = false;
        try {
            const prodInstallations = await this.installationsService.listAppInstallations({
                environment: 'production'
            });
            hasProdInstallations = !prodInstallations.installations.length;
        }
        catch (err) {
            this.deployView.displayListAppInstallationsError();
            if (verify) {
                throw err;
            }
        }
        const deployCommand = (await this.configFile.runtimeType()) === cli_shared_1.RuntimeType.nodejs
            ? this.nodePackageUploadDeployCommand
            : this.sandboxPackageUploadDeployCommand;
        const packageConfig = (_a = (await this.configFile.readConfig()).app) === null || _a === void 0 ? void 0 : _a.package;
        const analytics = await this.deployView.reportDeploymentProgress(appDetails, hasProdInstallations, () => deployCommand.execute({ handlers, resources, environmentKey: environment, packageConfig }));
        if (verify) {
            await this.verifyPostDeployment(environment);
        }
        try {
            analytics.analytics.egressPermissionList = await this.configFile.getEgressPermissions();
            analytics.analytics.connectKey = hasConnectKeyChanged
                ? { action: 'changed', value: await this.configFile.getConnectKey() }
                : hasConnectKeyDeleted
                    ? { action: 'deleted' }
                    : {};
        }
        catch (e) {
        }
        return analytics;
    }
}
exports.DeployController = DeployController;
