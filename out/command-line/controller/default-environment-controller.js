"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultEnvironmentController = exports.DefaultEnvironmentNotSetError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const environment_1 = require("../environment");
const utils_1 = require("../utils");
class DefaultEnvironmentNotSetError extends Error {
    constructor() {
        super(cli_shared_1.Text.defaultEnv.info);
    }
}
exports.DefaultEnvironmentNotSetError = DefaultEnvironmentNotSetError;
class DefaultEnvironmentController {
    constructor(ui, credentialStore, cachedConfigService, getAppConfig, loginCommand, createEnvironmentCommand, listEnvironmentCommand, getAppOwnerQuery) {
        this.ui = ui;
        this.credentialStore = credentialStore;
        this.cachedConfigService = cachedConfigService;
        this.getAppConfig = getAppConfig;
        this.loginCommand = loginCommand;
        this.createEnvironmentCommand = createEnvironmentCommand;
        this.listEnvironmentCommand = listEnvironmentCommand;
        this.getAppOwnerQuery = getAppOwnerQuery;
    }
    async run(nonInteractive) {
        const defaultEnvironment = await this.getDefaultEnvironment();
        if (defaultEnvironment) {
            return defaultEnvironment;
        }
        const credentials = await this.credentialStore.getCredentials();
        const [currentUser, owner] = await Promise.all([
            this.loginCommand.getUser(credentials),
            this.getAppOwnerQuery.execute()
        ]);
        if (owner.accountId === currentUser.accountId) {
            return this.setDefaultEnvironment(cli_shared_1.DEFAULT_ENVIRONMENT_KEY);
        }
        if (nonInteractive) {
            throw new DefaultEnvironmentNotSetError();
        }
        return this.promptAndSetDefaultEnvironmentForContributor(currentUser.name);
    }
    async getDefaultEnvironment() {
        try {
            const { id: appId } = await this.getAppConfig();
            return this.cachedConfigService.getDefaultEnvironment(appId);
        }
        catch (e) {
            if (e instanceof cli_shared_1.InvalidManifestError) {
                return undefined;
            }
            throw e;
        }
    }
    async promptAndSetDefaultEnvironmentForContributor(contributorName) {
        this.ui.info(cli_shared_1.Text.defaultEnv.info);
        this.ui.emptyLine();
        return this.promptAndSetDefaultEnvironment(contributorName);
    }
    async promptAndSetDefaultEnvironment(contributorName) {
        const suggestedName = (0, utils_1.getAcceptableSlug)(contributorName);
        let newEnvironmentKey = await this.ui.promptForText(cli_shared_1.Text.defaultEnv.prompt, suggestedName);
        this.ui.emptyLine();
        (0, environment_1.validateDevEnvironment)(newEnvironmentKey);
        newEnvironmentKey = (0, environment_1.checkEnvironmentOption)(newEnvironmentKey);
        if (await this.environmentExists(newEnvironmentKey)) {
            return this.setExistingEnvironmentAsDefault(contributorName, newEnvironmentKey);
        }
        return this.createAndSetDefaultEnvironment(newEnvironmentKey);
    }
    async environmentExists(environmentKey) {
        const environments = await this.listEnvironmentCommand.execute();
        return environments.some((environment) => environmentKey === environment.key);
    }
    async setExistingEnvironmentAsDefault(contributorName, environmentKey) {
        this.ui.warn(cli_shared_1.Text.defaultEnv.warn);
        this.ui.emptyLine();
        const confirm = await this.ui.confirm(cli_shared_1.Text.defaultEnv.confirm);
        this.ui.emptyLine();
        if (confirm) {
            await this.setDefaultEnvironment(environmentKey);
            this.ui.info(cli_shared_1.Text.defaultEnv.setSuccess(environmentKey, cli_shared_1.AppEnvironmentType.Development));
            this.ui.emptyLine();
            return environmentKey;
        }
        return this.promptAndSetDefaultEnvironment(contributorName);
    }
    async createAndSetDefaultEnvironment(environmentKey) {
        await this.createEnvironmentCommand.execute({ environmentKey });
        await this.setDefaultEnvironment(environmentKey);
        this.ui.info(cli_shared_1.Text.defaultEnv.createAndSetSuccess(environmentKey, cli_shared_1.AppEnvironmentType.Development));
        this.ui.emptyLine();
        return environmentKey;
    }
    async setDefaultEnvironment(environmentKey) {
        const { id: appId } = await this.getAppConfig();
        this.cachedConfigService.setDefaultEnvironment(appId, environmentKey);
        return environmentKey;
    }
}
exports.DefaultEnvironmentController = DefaultEnvironmentController;
