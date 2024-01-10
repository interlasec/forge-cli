"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelController = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const docker_service_1 = require("../../service/docker-service");
class TunnelController {
    constructor(analyticsService, nodeTunnelService, localTunnelService, dockerTunnelService, tunnelView, configFile) {
        this.analyticsService = analyticsService;
        this.nodeTunnelService = nodeTunnelService;
        this.localTunnelService = localTunnelService;
        this.dockerTunnelService = dockerTunnelService;
        this.tunnelView = tunnelView;
        this.configFile = configFile;
    }
    async run(tunnelOptions, ui) {
        const creds = await (0, cli_shared_1.getCredentialStore)(ui).getCredentials();
        const localTunnelErrorCallback = this.tunnelView.getTunnelErrorHandler(cli_shared_1.exitOnError);
        this.tunnelView.dockerPreamble(tunnelOptions.environment);
        if ((await this.configFile.runtimeType()) === cli_shared_1.RuntimeType.nodejs) {
            return await this.nodeTunnelService.run(tunnelOptions, creds, ui.debugEnabled);
        }
        if (process.env.FORGE_DEV_TUNNEL) {
            return await this.localTunnelService.run(tunnelOptions, creds, ui.debugEnabled, localTunnelErrorCallback);
        }
        await this.runDockerTunnel(tunnelOptions, creds, ui.debugEnabled);
    }
    async runDockerTunnel(tunnelOptions, creds, debugEnabled) {
        try {
            const imageDownloadChildProcess = await this.dockerTunnelService.bootstrapDocker();
            await this.tunnelView.reportDownloadProgress(imageDownloadChildProcess, this.analyticsService.getImageDownloadReporters(creds));
        }
        catch (err) {
            if (err.code === docker_service_1.DockerErrorCode.NOT_INSTALLED) {
                this.analyticsService.reportDockerVersion(creds, null);
                throw err;
            }
        }
        try {
            await this.dockerTunnelService.run(tunnelOptions, creds, debugEnabled);
        }
        catch (err) {
            if (err instanceof cli_shared_1.HiddenError) {
                throw err;
            }
        }
    }
}
exports.TunnelController = TunnelController;
