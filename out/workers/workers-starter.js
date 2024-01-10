"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersStarter = void 0;
const tslib_1 = require("tslib");
const cross_spawn_1 = require("cross-spawn");
const path_1 = tslib_1.__importDefault(require("path"));
class WorkersStarter {
    constructor(workerInfo) {
        let prg = 'node';
        let filePath = './forge-cli-workers.js';
        if (process.env.NODE_ENV == 'development') {
            prg = 'ts-node';
            filePath = './forge-cli-workers.ts';
        }
        const workers = (0, cross_spawn_1.spawn)(prg, [path_1.default.join(__dirname, filePath), JSON.stringify(workerInfo || '')], {
            detached: true,
            stdio: 'ignore'
        });
        workers.unref();
    }
}
exports.WorkersStarter = WorkersStarter;
