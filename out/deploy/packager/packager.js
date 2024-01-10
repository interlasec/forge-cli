"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppPackager = exports.BundlerError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class BundlerError extends cli_shared_1.UserError {
}
exports.BundlerError = BundlerError;
class AppPackager {
    constructor(runtimeBundler, nativeUiBundler, logger) {
        this.runtimeBundler = runtimeBundler;
        this.nativeUiBundler = nativeUiBundler;
        this.logger = logger;
    }
    async package(handlers, resources, packageConfig) {
        this.logger.info(cli_shared_1.Text.deploy.taskPackage.title);
        const runtimeBundle = await this.runtimeBundler.bundle(handlers, packageConfig);
        const nativeUiBundle = await this.nativeUiBundler.bundle(resources);
        return Object.assign(Object.assign({}, runtimeBundle), nativeUiBundle);
    }
}
exports.AppPackager = AppPackager;
