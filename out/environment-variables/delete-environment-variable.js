"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEnvironmentVariableCommand = void 0;
class DeleteEnvironmentVariableCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.deleteEnvironmentVariable(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.DeleteEnvironmentVariableCommand = DeleteEnvironmentVariableCommand;
