"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStorage = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
const fs_extra_1 = require("fs-extra");
class LocalFileStorage {
    constructor() {
        if (!fs.existsSync(LocalFileStorage.FOLDER)) {
            (0, fs_extra_1.mkdirpSync)(LocalFileStorage.FOLDER);
        }
    }
    addAnalyticsEvent(message) {
        try {
            fs.writeFileSync(path_1.default.join(LocalFileStorage.FOLDER, `${message.id}.json`), JSON.stringify(message));
        }
        catch (e) {
        }
    }
    async getAnalyticsEvent(file) {
        try {
            const content = await fs.promises.readFile(path_1.default.join(LocalFileStorage.FOLDER, file), {
                encoding: 'utf8'
            });
            const parsedContent = JSON.parse(content);
            parsedContent.event.timestamp = new Date(parsedContent.event.timestamp);
            return parsedContent;
        }
        catch (e) {
            return undefined;
        }
    }
    getAnalytics() {
        try {
            return fs.readdirSync(LocalFileStorage.FOLDER).filter((f) => f.endsWith('.json'));
        }
        catch (e) {
            return [];
        }
    }
    async deleteAnalyticsEvent(file) {
        try {
            await fs.promises.unlink(path_1.default.join(LocalFileStorage.FOLDER, file));
        }
        catch (e) {
        }
    }
}
exports.LocalFileStorage = LocalFileStorage;
LocalFileStorage.STORAGE_PATHS = (0, env_paths_1.default)('forge-cli');
LocalFileStorage.FOLDER = LocalFileStorage.STORAGE_PATHS.data;
