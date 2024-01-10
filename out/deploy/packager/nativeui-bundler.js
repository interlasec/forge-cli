"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeUIBundler = void 0;
const packager_1 = require("./packager");
class NativeUIBundler {
    constructor(logger, bundler) {
        this.logger = logger;
        this.bundler = bundler;
    }
    async bundle(resources) {
        const entryPoints = resources.map(({ key, path }) => ({
            name: key,
            path
        }));
        const nativeUiBundlesDetails = [];
        if (entryPoints.length > 0) {
            let bundlerOutputs;
            try {
                bundlerOutputs = await Promise.all(entryPoints.map((entrypoint) => this.bundler(this.logger, [entrypoint])));
            }
            catch (e) {
                throw new packager_1.BundlerError(e.message);
            }
            bundlerOutputs.forEach(({ outputDir }, index) => {
                this.logger.debug(`NativeUI bundle created: ${outputDir}`);
                nativeUiBundlesDetails.push(Object.assign(Object.assign({}, resources[index]), { path: outputDir }));
            });
        }
        return {
            nativeUiBundlesDetails
        };
    }
}
exports.NativeUIBundler = NativeUIBundler;
