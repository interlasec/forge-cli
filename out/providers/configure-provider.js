"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureProviderCommand = void 0;
class ConfigureProviderCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.configureProvider(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.ConfigureProviderCommand = ConfigureProviderCommand;
