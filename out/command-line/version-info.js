"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearVersionCache = exports.cacheLatestVersion = exports.humanReadableSupportedNodeVersion = exports.semverSupportedNodeVersion = exports.getCLIDetails = exports.VERSION_CACHE_INTERVAL = exports.VERSION_CACHE_KEY = void 0;
exports.VERSION_CACHE_KEY = 'latest';
exports.VERSION_CACHE_INTERVAL = 1000 * 60 * 60 * 24;
const cli_shared_1 = require("@forge/cli-shared");
const getCLIDetails = () => {
    try {
        const packageInfo = require('../../package.json');
        const cachedConf = cli_shared_1.CachedConf.getCache(packageInfo.name);
        const latest = cachedConf.get(exports.VERSION_CACHE_KEY);
        return {
            name: packageInfo.name,
            version: packageInfo.version,
            latest: latest,
            compatibleNodeVersion: packageInfo.engines.node
        };
    }
    catch (_a) {
        return undefined;
    }
};
exports.getCLIDetails = getCLIDetails;
const supportedNodeMajorVersions = [18, 20];
exports.semverSupportedNodeVersion = supportedNodeMajorVersions.map((v) => `${v}.x`).join(' || ');
exports.humanReadableSupportedNodeVersion = supportedNodeMajorVersions
    .map((v) => `${v}.x`)
    .join(', ')
    .replace(/^(.*)?,\s(.*)$/g, '$1 or $2');
const cacheLatestVersion = async (name) => {
    const latestVersion = (await import('latest-version')).default;
    const latest = await latestVersion(name);
    const cachedConf = cli_shared_1.CachedConf.getCache(name);
    cachedConf.set(exports.VERSION_CACHE_KEY, latest, exports.VERSION_CACHE_INTERVAL);
};
exports.cacheLatestVersion = cacheLatestVersion;
const clearVersionCache = (name) => {
    const cachedConf = cli_shared_1.CachedConf.getCache(name);
    cachedConf.delete(exports.VERSION_CACHE_KEY);
};
exports.clearVersionCache = clearVersionCache;
