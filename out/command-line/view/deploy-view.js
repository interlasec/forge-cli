"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployView = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const lint_1 = require("@forge/lint");
const ari_1 = require("@forge/util/packages/ari");
class DeployView {
    constructor(ui) {
        this.ui = ui;
    }
    getLogger() {
        return this.ui;
    }
    displayStart(environment, environmentType) {
        this.ui.info(cli_shared_1.Text.deploy.cmd.start1(environment, environmentType));
    }
    displayListAppInstallationsError() {
        this.ui.info(cli_shared_1.Text.deploy.taskListInstallation.listInstallationError);
    }
    displayLintRunning() {
        this.ui.info(cli_shared_1.Text.lint.running);
    }
    displayOutdatedInstallationsMessage() {
        this.ui.emptyLine();
        this.ui.warn(cli_shared_1.Text.deploy.outdatedInstallations);
    }
    displayIndexingCommand(environment) {
        this.ui.emptyLine();
        this.ui.info(cli_shared_1.Text.deploy.listIndexes(environment));
    }
    displayLintErrors(lintResults) {
        this.ui.info(cli_shared_1.Text.deploy.taskLint.lintError);
        (0, lint_1.reportLintResults)(this.ui, lintResults);
    }
    displayLintWarnings(warnings) {
        this.ui.info(cli_shared_1.Text.deploy.taskLint.lintWarning(warnings) + '\n');
    }
    displayNoLintProblems() {
        this.ui.info(cli_shared_1.LogColor.trace(cli_shared_1.Text.lint.noProblems) + '\n');
    }
    displayConnectKeyChangeWarning(environment, migrationKey, connectKey) {
        this.ui.warn(cli_shared_1.Text.deploy.connectKeyChange.connectKeyChangeWarning(environment, migrationKey, connectKey));
    }
    displayConnectKeyDeleteWarning(environment) {
        this.ui.warn(cli_shared_1.Text.deploy.connectKeyChange.connectKeyDeleteWarning(environment));
    }
    displayMPACAppConnectKeyChangeError(mpacAppKey, connectKey) {
        this.ui.info(cli_shared_1.Text.deploy.connectKeyChange.mpacAppConnectKeyChangeError(mpacAppKey, connectKey));
    }
    displayEnvironmentCreationWarning(environment) {
        this.ui.emptyLine();
        this.ui.warn(cli_shared_1.Text.env.warn.envWillBeCreated(environment));
        this.ui.emptyLine();
    }
    displayEnvironmentCreationSuccessMessage(environment) {
        this.ui.info(cli_shared_1.Text.createEnvironment.cmd.success(environment, cli_shared_1.AppEnvironmentType.Development));
        this.ui.emptyLine();
    }
    async promptToContinueDeletingConnectKey() {
        return await this.ui.confirm(cli_shared_1.Text.deploy.connectKeyChange.continueDelete);
    }
    async promptToContinueChangingConnectKey() {
        return await this.ui.confirm(cli_shared_1.Text.deploy.connectKeyChange.continueChange);
    }
    async promptToCreateEnvironment() {
        const confirm = await this.ui.confirm(cli_shared_1.Text.env.confirm);
        this.ui.emptyLine();
        return confirm;
    }
    async promptToContinueDeploymentWhileReindexing() {
        this.ui.emptyLine();
        return await this.ui.confirm(cli_shared_1.Text.deploy.reindexingInProgress.continueDeployment);
    }
    displaySuccessfulDeploymentWhileReindexing() {
        this.ui.emptyLine();
        this.ui.info(cli_shared_1.Text.deploy.reindexingInProgress.successfulDeployment);
    }
    async reportDeploymentProgress({ appAri, name, environmentKey, environmentType }, showDistributionPageLink, deployCallback) {
        const result = await this.ui.displayProgress(() => deployCallback(), cli_shared_1.Text.deploy.cmd.start2(name, environmentKey, environmentType), cli_shared_1.Text.deploy.cmd.success);
        this.ui.info(cli_shared_1.Text.deploy.cmd.successDetails(name, environmentKey, environmentType));
        if (environmentType === cli_shared_1.AppEnvironmentType.Production && showDistributionPageLink) {
            this.ui.info(cli_shared_1.Text.deploy.cmd.distributePageLink(ari_1.EcosystemAppAri.parse(appAri).appId));
        }
        return result;
    }
}
exports.DeployView = DeployView;
