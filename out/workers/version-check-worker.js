"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionCheckWorker = void 0;
const version_info_1 = require("../command-line/version-info");
class VersionCheckWorker {
    constructor(workerInfo) {
        this.workerInfo = workerInfo;
    }
    async doWork() {
        if (!this.workerInfo || !this.workerInfo.checkForUpdate) {
            return;
        }
        try {
            await (0, version_info_1.cacheLatestVersion)(this.workerInfo.name);
        }
        catch (e) {
        }
    }
}
exports.VersionCheckWorker = VersionCheckWorker;
