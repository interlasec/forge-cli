"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelAnalyticsService = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class TunnelAnalyticsService {
    constructor(analyticsClientReporter, cliDetails) {
        this.analyticsClientReporter = analyticsClientReporter;
        this.cliDetails = cliDetails;
    }
    reportDockerVersion(creds, dockerVersion) {
        this.analyticsClientReporter.reportSuccess('docker version check', creds, {
            dockerVersion
        });
    }
    reportTunnelClosed(creds) {
        this.analyticsClientReporter.reportSuccess('close tunnel', creds, {});
    }
    reportTunnelFailure(creds, errorName, attributes) {
        var _a, _b;
        attributes = Object.assign({ error: errorName, version: (_a = this.cliDetails) === null || _a === void 0 ? void 0 : _a.version, latest: (_b = this.cliDetails) === null || _b === void 0 ? void 0 : _b.latest, isLatest: (0, cli_shared_1.isLatestCLIVersion)(this.cliDetails) }, attributes);
        if (attributes.isUserError === undefined) {
            attributes = Object.assign(Object.assign({}, attributes), { isUserError: false });
        }
        this.analyticsClientReporter.reportInvokeFailure('tunnel', creds, attributes);
    }
    getImageDownloadReporters(creds) {
        return {
            onStart: () => this.analyticsClientReporter.reportSuccess('image download started', creds, {}),
            onFailure: () => this.analyticsClientReporter.reportSuccess('image download failed', creds, {}),
            onSuccess: () => this.analyticsClientReporter.reportSuccess('image download finished', creds, {})
        };
    }
}
exports.TunnelAnalyticsService = TunnelAnalyticsService;
