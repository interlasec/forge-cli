"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerService = exports.DockerErrorCode = exports.DOCKER_DOWNLOAD_LINK = exports.DockerError = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const command_exists_1 = tslib_1.__importDefault(require("command-exists"));
const child_process_1 = require("child_process");
const cross_spawn_1 = require("cross-spawn");
const path_1 = tslib_1.__importDefault(require("path"));
class DockerError extends cli_shared_1.UserError {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.DockerError = DockerError;
exports.DOCKER_DOWNLOAD_LINK = 'https://docs.docker.com/get-docker/';
var DockerErrorCode;
(function (DockerErrorCode) {
    DockerErrorCode[DockerErrorCode["DAEMON_NOT_RUNNING"] = 0] = "DAEMON_NOT_RUNNING";
    DockerErrorCode[DockerErrorCode["NOT_INSTALLED"] = 1] = "NOT_INSTALLED";
})(DockerErrorCode = exports.DockerErrorCode || (exports.DockerErrorCode = {}));
class DockerService {
    runContainer(args) {
        return (0, cross_spawn_1.spawn)('docker', ['run', ...args], { stdio: ['inherit', 'inherit', 'pipe'] });
    }
    async getDockerVersion(debugEnabled) {
        if (!command_exists_1.default.sync('docker')) {
            throw new DockerError(cli_shared_1.Text.tunnel.error.dockerNotInstalled(exports.DOCKER_DOWNLOAD_LINK), DockerErrorCode.NOT_INSTALLED);
        }
        const { err, stdout } = await this.execPromise('docker version --format "{{.Server.Version}}"');
        if (err) {
            throw new DockerError(cli_shared_1.Text.tunnel.error.dockerDaemonNotRunning(err.message, debugEnabled), DockerErrorCode.DAEMON_NOT_RUNNING);
        }
        const dockerVersion = stdout.trim();
        const dockerVersionArr = dockerVersion.split('.');
        const dockerMajorVersion = parseInt(dockerVersionArr[0], 10);
        const dockerMinorVersion = parseInt(dockerVersionArr[1], 10);
        return {
            full: dockerVersion,
            major: dockerMajorVersion,
            minor: dockerMinorVersion
        };
    }
    async removeContainer(containerName) {
        await this.execPromise(`docker rm -f ${containerName}`);
    }
    downloadImage(imageName) {
        return (0, cross_spawn_1.spawn)('docker', ['pull', imageName]);
    }
    startCleanupWorker(pids, containerName) {
        const dockerCleanUp = (0, cross_spawn_1.spawn)(process.env.NODE_ENV === 'development' ? 'ts-node' : 'node', [path_1.default.join(__dirname, '../workers/tunnel-cleanup-worker')], { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
        const message = {
            pids,
            containers: [containerName]
        };
        dockerCleanUp.send(message);
    }
    execPromise(cmd) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
                resolve({
                    err: err,
                    stdout: stdout,
                    stderr: stderr
                });
            });
        });
    }
}
exports.DockerService = DockerService;
