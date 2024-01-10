"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWebTriggerURLCommand = void 0;
const ari_1 = require("@forge/util/packages/ari");
class GetWebTriggerURLCommand {
    constructor(getAppConfig, webTriggerClient, appEnvironmentClient, webTriggerGraphqlClient) {
        this.getAppConfig = getAppConfig;
        this.webTriggerClient = webTriggerClient;
        this.appEnvironmentClient = appEnvironmentClient;
        this.webTriggerGraphqlClient = webTriggerGraphqlClient;
    }
    async execute(installationId, functionKey) {
        const { id: appId } = await this.getAppConfig();
        const { environmentKey, context } = await this.webTriggerClient.getInstallation(appId, installationId);
        const environmentId = await this.appEnvironmentClient.getAppEnvironmentId(appId, environmentKey);
        return await this.webTriggerGraphqlClient.createWebTriggerUrl({
            appId: ari_1.EcosystemAppAri.parse(appId).appId,
            contextId: context,
            environmentId: environmentId,
            triggerKey: functionKey
        });
    }
}
exports.GetWebTriggerURLCommand = GetWebTriggerURLCommand;
