"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFilePortFindingService = void 0;
const portfinder_1 = require("portfinder");
const util_1 = require("util");
const getPortsPromise = (0, util_1.promisify)(portfinder_1.getPorts);
class ConfigFilePortFindingService {
    constructor(configFile) {
        this.configFile = configFile;
    }
    async findPorts(minPort) {
        const resources = await this.configFile.getResources();
        const resourceKeys = resources.map((resource) => resource.key);
        if (!resourceKeys.length)
            return {};
        const portOptions = {};
        if (minPort) {
            portOptions['port'] = minPort + 1;
        }
        const ports = await getPortsPromise(resourceKeys.length, portOptions);
        const portMap = {};
        resourceKeys.forEach((resourceKey, idx) => {
            portMap[resourceKey] = ports[idx];
        });
        return portMap;
    }
    async findPortAfter(portsTaken) {
        if (!portsTaken.length)
            return undefined;
        const max = Math.max(...portsTaken);
        return (await getPortsPromise(1, { port: max + 1 }))[0];
    }
}
exports.ConfigFilePortFindingService = ConfigFilePortFindingService;
