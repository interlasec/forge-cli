"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallAppSiteCommand = void 0;
class InstallAppSiteCommand {
    constructor(getAppConfig, installAppClient) {
        this.getAppConfig = getAppConfig;
        this.installAppClient = installAppClient;
    }
    async execute({ environmentKey, site, product }) {
        const { id: appId } = await this.getAppConfig();
        return await this.installAppClient.installAppIntoSite({
            appId,
            environmentKey,
            site,
            product
        });
    }
}
exports.InstallAppSiteCommand = InstallAppSiteCommand;
