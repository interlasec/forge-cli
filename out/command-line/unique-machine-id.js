"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachineId = void 0;
const uuid_1 = require("uuid");
const node_machine_id_1 = require("node-machine-id");
const cli_shared_1 = require("@forge/cli-shared");
const MACHINE_ID_CACHE_KEY = 'machineId';
const generateMachineId = () => {
    try {
        return (0, node_machine_id_1.machineIdSync)();
    }
    catch (e) {
        return (0, uuid_1.v4)();
    }
};
const getMachineId = () => cli_shared_1.CachedConf.getCache(cli_shared_1.CONFIG_PROJECT_NAME).cached(MACHINE_ID_CACHE_KEY, generateMachineId);
exports.getMachineId = getMachineId;
