"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelView = exports.TunnelViewError = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const ora_1 = tslib_1.__importDefault(require("ora"));
class TunnelViewError extends cli_shared_1.UserError {
}
exports.TunnelViewError = TunnelViewError;
class TunnelView {
    constructor(ui) {
        this.ui = ui;
        this.FAILED_DOCKER_CONNECTION_MESSAGE = 'Cannot connect to the Docker daemon';
    }
    dockerPreamble(environmentKey) {
        this.ui.info(cli_shared_1.Text.tunnel.preamble);
        if (environmentKey && environmentKey !== cli_shared_1.DEFAULT_ENVIRONMENT_KEY) {
            this.ui.emptyLine();
            this.ui.info(cli_shared_1.Text.tunnel.startingTunnel(environmentKey, (0, cli_shared_1.guessEnvironmentType)(environmentKey)));
            this.ui.emptyLine();
        }
        this.ui.info(cli_shared_1.Text.ctrlC);
        this.ui.emptyLine();
    }
    getTunnelErrorHandler(exitFn) {
        const handler = async (err) => {
            if (this.ui.debugEnabled)
                this.ui.error(err);
            return await exitFn(this.ui, new TunnelViewError(cli_shared_1.Text.tunnel.error.tunnelPackageMissing));
        };
        return handler;
    }
    updatePullPercent(dataBuffer, dockerPullPercent) {
        const regexPullStarted = /(Pulling fs layer)/g;
        const regexWait = /(Waiting)/g;
        const regexVerify = /(Verifying Checksum)/g;
        const regexDownloadComplete = /(Download complete)/g;
        const regexPullComplete = /(Pull complete)/g;
        const regexDigest = /(Digest: )/g;
        const progress = dataBuffer.toString();
        if (dockerPullPercent >= 99) {
            return dockerPullPercent;
        }
        if (progress.match(regexPullComplete) || progress.match(regexDigest)) {
            dockerPullPercent = 99;
            return dockerPullPercent;
        }
        if (progress.match(regexDownloadComplete) && dockerPullPercent < 95) {
            dockerPullPercent = 95;
            return dockerPullPercent;
        }
        dockerPullPercent = this.calculateProgress(progress, regexPullStarted, dockerPullPercent, 33);
        dockerPullPercent = this.calculateProgress(progress, regexWait, dockerPullPercent, 66);
        dockerPullPercent = this.calculateProgress(progress, regexVerify, dockerPullPercent, 92);
        return dockerPullPercent;
    }
    calculateProgress(progress, regex, dockerPullPercent, clamp) {
        if (progress.match(regex) && dockerPullPercent <= clamp) {
            const expectedNewPercent = dockerPullPercent + progress.match(regex).length * 3;
            return Math.min(expectedNewPercent, clamp);
        }
        return dockerPullPercent;
    }
    reportDownloadProgress(imageDownloadChildProcess, { onStart, onFailure, onSuccess }) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            let dockerPullPercent = 0;
            const spinner = (0, ora_1.default)({
                spinner: {
                    frames: ['']
                },
                prefixText: cli_shared_1.Text.tunnel.pullDockerProgress(dockerPullPercent)
            }).start();
            onStart();
            (_a = imageDownloadChildProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                dockerPullPercent = this.updatePullPercent(data, dockerPullPercent);
                spinner.prefixText = cli_shared_1.Text.tunnel.pullDockerProgress(dockerPullPercent);
            });
            (_b = imageDownloadChildProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                spinner.prefixText = cli_shared_1.Text.tunnel.error.pullDocker;
                spinner.stopAndPersist();
                this.ui.warn(cli_shared_1.Text.tunnel.error.dockerPullFailed(''));
                if (data.toString().startsWith(this.FAILED_DOCKER_CONNECTION_MESSAGE)) {
                    this.ui.warn(cli_shared_1.Text.tunnel.error.dockerDaemonNotRunning(data.toString(), this.ui.debugEnabled));
                }
                this.ui.emptyLine();
                imageDownloadChildProcess.removeAllListeners();
                onFailure();
                reject(data.toString());
            });
            imageDownloadChildProcess.on('exit', () => {
                spinner.prefixText = cli_shared_1.Text.tunnel.pullDockerProgress(100);
                spinner.stopAndPersist();
                this.ui.info(cli_shared_1.LogColor.trace(cli_shared_1.Text.tunnel.pullDockerSuccess));
                onSuccess();
                resolve();
            });
        });
    }
}
exports.TunnelView = TunnelView;
