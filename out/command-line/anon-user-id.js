"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnonId = void 0;
const uuid_1 = require("uuid");
const cli_shared_1 = require("@forge/cli-shared");
const ANON_ID_CACHE_KEY = 'anonId';
function getAnonId(createNew = false) {
    const cachedConf = cli_shared_1.CachedConf.getCache(cli_shared_1.CONFIG_PROJECT_NAME);
    return cachedConf.cached(ANON_ID_CACHE_KEY, () => {
        if (!createNew) {
            return undefined;
        }
        return (0, uuid_1.v4)();
    });
}
exports.getAnonId = getAnonId;
