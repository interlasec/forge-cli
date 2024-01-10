"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelCleanUpWorker = void 0;
const os_1 = require("os");
const cross_spawn_1 = require("cross-spawn");
class TunnelCleanUpWorker {
    doWork() {
        let pids;
        let containers;
        const messageHandler = ({ pids: passedPids, containers: passedContainers }) => {
            pids = passedPids;
            containers = passedContainers;
        };
        const disconnectHandler = ({ pids, containers }) => {
            pids.forEach((pid) => {
                process.kill(pid, os_1.constants.signals.SIGINT);
            });
            (0, cross_spawn_1.spawn)('docker', ['rm', '-f', ...containers]);
            process.exit(0);
        };
        process.on('message', messageHandler);
        process.on('disconnect', () => {
            disconnectHandler({ pids, containers });
        });
    }
}
exports.TunnelCleanUpWorker = TunnelCleanUpWorker;
if (require.main === module) {
    const worker = new TunnelCleanUpWorker();
    worker.doWork();
}
