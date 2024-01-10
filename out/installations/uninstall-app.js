"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UninstallAppCommand = void 0;
class UninstallAppCommand {
    constructor(getAppConfig, client) {
        this.getAppConfig = getAppConfig;
        this.client = client;
    }
    async execute(installationId) {
        const { id: appId } = await this.getAppConfig();
        const { product, site, environmentKey } = await this.client.getInstallation(appId, installationId);
        const success = await this.client.uninstallApp({ appId, environmentKey, installationId, async: true });
        return {
            product,
            site,
            environmentKey,
            successful: success
        };
    }
    async batchExecute(installationIds = [], installationInfos) {
        const { id: appId } = await this.getAppConfig();
        let appsInstallInfo;
        if (installationInfos && installationInfos.length) {
            appsInstallInfo = installationInfos;
        }
        else {
            appsInstallInfo = await Promise.all(installationIds.map((installId) => this.client.getInstallation(appId, installId)));
        }
        const uninstallOutput = await this.client.uninstallMultipleApps(appsInstallInfo.map((installInfo) => ({
            appId,
            environmentKey: installInfo.environmentKey,
            installationId: installInfo.id,
            async: true
        })));
        return appsInstallInfo.map(({ product, site, environmentKey }, index) => ({
            product,
            site,
            environmentKey,
            successful: uninstallOutput[index].successful
        }));
    }
}
exports.UninstallAppCommand = UninstallAppCommand;
