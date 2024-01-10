"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEnvironmentCommand = void 0;
class CreateEnvironmentCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.createEnvironment(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.CreateEnvironmentCommand = CreateEnvironmentCommand;
