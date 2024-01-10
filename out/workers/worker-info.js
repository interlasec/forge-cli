"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerInfo = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const getWorkerInfo = (cliDetails) => {
    if (!cliDetails) {
        return undefined;
    }
    return {
        name: cliDetails.name,
        checkForUpdate: cliDetails.latest === undefined,
        environment: (0, cli_shared_1.getEnvironment)()
    };
};
exports.getWorkerInfo = getWorkerInfo;
