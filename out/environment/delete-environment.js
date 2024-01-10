"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEnvironmentCommand = void 0;
class DeleteEnvironmentCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async batchExecute(details) {
        const { id: appId } = await this.getAppConfig();
        return this.client.deleteEnvironments(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.DeleteEnvironmentCommand = DeleteEnvironmentCommand;
