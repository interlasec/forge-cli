"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetEnvironmentVariableCommand = void 0;
class SetEnvironmentVariableCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.setEnvironmentVariable(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.SetEnvironmentVariableCommand = SetEnvironmentVariableCommand;
