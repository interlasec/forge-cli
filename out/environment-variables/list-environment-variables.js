"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEnvironmentVariablesCommand = void 0;
class ListEnvironmentVariablesCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        return await this.client.listEnvironmentVariables(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.ListEnvironmentVariablesCommand = ListEnvironmentVariablesCommand;
