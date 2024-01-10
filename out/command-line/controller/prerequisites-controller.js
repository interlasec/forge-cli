"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrerequisitesController = void 0;
const semver_1 = require("semver");
const cli_shared_1 = require("@forge/cli-shared");
const version_info_1 = require("../version-info");
const getNodeVersion_1 = require("./getNodeVersion");
class PrerequisitesController {
    constructor(logger, featureFlags, cliDetails) {
        this.logger = logger;
        this.featureFlags = featureFlags;
        this.cliDetails = cliDetails;
    }
    async check() {
        await Promise.all([this.checkNodeVersion(), this.checkCustomWarning()]);
    }
    async checkNodeVersion() {
        const userNodeVersion = (0, getNodeVersion_1.getNodeVersion)();
        if (this.cliDetails && !(0, semver_1.satisfies)(userNodeVersion, this.cliDetails.compatibleNodeVersion)) {
            await (0, cli_shared_1.exitOnError)(this.logger, new Error(cli_shared_1.Text.error.outdatedNodeVersion(this.cliDetails.compatibleNodeVersion, userNodeVersion)), null);
        }
        if (!(0, semver_1.satisfies)(userNodeVersion, version_info_1.semverSupportedNodeVersion)) {
            this.logger.warn(cli_shared_1.Text.warning.unsupportedNodeVersion(userNodeVersion, version_info_1.humanReadableSupportedNodeVersion));
        }
    }
    async checkCustomWarning() {
        const featureFlagValue = await this.featureFlags.readFlag('forge-cli-startup-warning');
        if (featureFlagValue) {
            this.logger.warn(featureFlagValue);
        }
    }
}
exports.PrerequisitesController = PrerequisitesController;
