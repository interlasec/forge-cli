"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEnvironmentCommand = void 0;
class ListEnvironmentCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute() {
        const { id: appId } = await this.getAppConfig();
        return this.client.listEnvironment({
            appId
        });
    }
}
exports.ListEnvironmentCommand = ListEnvironmentCommand;
