"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHangingIdentityInstallationsFromSite = exports.UninstallAppError = void 0;
class UninstallAppError extends Error {
}
exports.UninstallAppError = UninstallAppError;
const getHangingIdentityInstallationsFromSite = (allInstallations, remainingApps, sites) => {
    const hangingIdentityInstalls = [];
    sites.forEach((site) => {
        const shouldUninstallIdentity = remainingApps.filter((app) => app.site === site).length === 0;
        if (shouldUninstallIdentity) {
            const identityInstall = allInstallations.find((install) => install.site === site && install.product === 'identity');
            if (identityInstall) {
                hangingIdentityInstalls.push(identityInstall);
            }
        }
    });
    return hangingIdentityInstalls;
};
exports.getHangingIdentityInstallationsFromSite = getHangingIdentityInstallationsFromSite;
