"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerTunnelService = exports.LocalTunnelService = exports.InProcessTunnelService = exports.DebugNotSupportedError = exports.HiddenDockerTunnelError = exports.IMAGE_NAME = exports.CONTAINER_NAME = void 0;
const tslib_1 = require("tslib");
const cross_spawn_1 = require("cross-spawn");
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = require("path");
const portfinder_1 = require("portfinder");
const semver_1 = require("semver");
const cli_shared_1 = require("@forge/cli-shared");
const version_info_1 = require("../command-line/version-info");
const DISABLE_TTY = process.env.DISABLE_TTY === 'true';
exports.CONTAINER_NAME = `forge-tunnel-docker-${process.pid}`;
const PATH_DOCKER_NGROK_CONFIG = '/opt/provided-ngrok-config.yml';
const cliDetails = (0, version_info_1.getCLIDetails)();
let versionTags;
if ((cliDetails === null || cliDetails === void 0 ? void 0 : cliDetails.version) !== undefined) {
    if (process.env.FORGE_IN_LOCAL_E2E === 'true') {
        versionTags = ['e2e'];
    }
    else {
        versionTags = (0, semver_1.prerelease)(cliDetails.version) || ['latest'];
    }
}
else {
    versionTags = ['latest'];
}
exports.IMAGE_NAME = process.env.FORGE_DEV_DOCKER_TUNNEL
    ? 'local/forge-tunnel:test'
    : `atlassian/forge-tunnel:${versionTags[0]}`;
class HiddenDockerTunnelError extends cli_shared_1.HiddenError {
    constructor(userError, message) {
        super(message);
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
exports.HiddenDockerTunnelError = HiddenDockerTunnelError;
class DebugNotSupportedError extends cli_shared_1.UserError {
    constructor() {
        super(cli_shared_1.Text.tunnel.inspectorUnsupported);
    }
}
exports.DebugNotSupportedError = DebugNotSupportedError;
class TunnelServiceBase {
    constructor(cachedConfigService) {
        this.cachedConfigService = cachedConfigService;
    }
    ngrokConfigPath() {
        const path = this.cachedConfigService.getNgrokConfigPath();
        if (!path) {
            throw new cli_shared_1.UserError(cli_shared_1.Text.tunnel.error.noNgrokConfig);
        }
        return path;
    }
}
class InProcessTunnelService extends TunnelServiceBase {
    constructor(ui, startTunnelCommand, tunnelInteractor, configFilePortFindingService, cachedConfigService, analyticsService) {
        super(cachedConfigService);
        this.ui = ui;
        this.startTunnelCommand = startTunnelCommand;
        this.tunnelInteractor = tunnelInteractor;
        this.configFilePortFindingService = configFilePortFindingService;
        this.analyticsService = analyticsService;
    }
    async run(tunnelOptions, creds, debugEnabled, onError) {
        try {
            if (tunnelOptions.debug === true) {
                throw new DebugNotSupportedError();
            }
            const resourcePortMap = await this.configFilePortFindingService.findPorts();
            const tunnel = await this.startTunnelCommand.execute({
                environmentKey: tunnelOptions.environment || process.env.ENVIRONMENT_KEY || 'default',
                resourcePortMap,
                host: 'localhost',
                ngrokConfig: this.ngrokConfigPath()
            });
            const monitor = await this.tunnelInteractor.watchApp(tunnel);
            await this.tunnelInteractor.handleUserExitEvent(tunnel.stopFunction, monitor);
        }
        catch (e) {
            this.analyticsService.reportTunnelFailure(creds, e.constructor.name, (0, cli_shared_1.isErrorWithAnalytics)(e) ? e.getAttributes() : {});
            if (onError) {
                await onError(e);
            }
            else {
                await (0, cli_shared_1.exitOnError)(this.ui, e);
            }
        }
    }
}
exports.InProcessTunnelService = InProcessTunnelService;
class SandboxTunnelServiceBase extends TunnelServiceBase {
    constructor(configFilePortFindingService, cachedConfigService) {
        super(cachedConfigService);
        this.configFilePortFindingService = configFilePortFindingService;
        this.cachedConfigService = cachedConfigService;
    }
    async getTunnelProcessEnvironment(tunnelOptions, debugEnabled, { email, token }, port, cspReporterPort, resourcePorts) {
        var _a;
        try {
            const graphqlGateway = (0, cli_shared_1.getGraphqlGateway)();
            return [
                { key: 'APP_FOLDER', value: '/app' },
                { key: 'FORGE_EMAIL', value: email },
                { key: 'FORGE_API_TOKEN', value: token },
                { key: 'ENVIRONMENT_KEY', value: (_a = tunnelOptions.environment) !== null && _a !== void 0 ? _a : 'default' },
                { key: 'TUNNEL_INSPECTOR_ENABLED', value: (!!tunnelOptions.debug).toString() },
                { key: 'FORGE_GRAPHQL_GATEWAY', value: graphqlGateway },
                { key: 'VERBOSE_MODE', value: `${debugEnabled}` },
                { key: 'CLI_DETAILS', value: JSON.stringify(cliDetails) },
                ...this.getInspectorPortEnvironment(port),
                ...this.getCspReporterPortEnvironment(cspReporterPort),
                ...this.getResourcePortEnvironment(resourcePorts),
                ...this.getUserEnvironmentVariables(),
                ...this.getNgrokConfigEnvironment()
            ];
        }
        catch (e) {
            throw new HiddenDockerTunnelError(false, "Couldn't populate docker options for tunneling");
        }
    }
    getInspectorPortEnvironment(port) {
        return [{ key: 'TUNNEL_INSPECTOR_PORT', value: port.toString() }];
    }
    getNgrokConfigEnvironment() {
        return [{ key: 'NGROK_CONFIG', value: this.ngrokConfigPath() }];
    }
    getCspReporterPortEnvironment(cspReporterPort) {
        if (cspReporterPort) {
            return [{ key: 'CSP_REPORTER_PORT', value: cspReporterPort.toString() }];
        }
        return [];
    }
    getResourcePortEnvironment(resourcePorts) {
        return [{ key: `RESOURCE_PORT_MAP`, value: JSON.stringify(resourcePorts) }];
    }
    getUserEnvironmentVariables() {
        const vars = [];
        Object.keys(process.env)
            .filter((variable) => variable.startsWith('FORGE_USER_VAR_'))
            .forEach((name) => {
            var _a;
            vars.push({ key: name, value: (_a = process.env[name]) !== null && _a !== void 0 ? _a : 'undefined' });
        });
        return vars;
    }
}
class LocalTunnelService extends SandboxTunnelServiceBase {
    async run(tunnelOptions, creds, debugEnabled, onError) {
        const port = await (0, portfinder_1.getPortPromise)();
        const resourcePorts = await this.configFilePortFindingService.findPorts();
        const cspReporterPort = await this.configFilePortFindingService.findPortAfter(Object.values(resourcePorts));
        const environment = await this.getTunnelProcessEnvironment(tunnelOptions, debugEnabled, creds, port, cspReporterPort, resourcePorts);
        const env = this.formatEnvForLocalTunnel(environment);
        const process = (0, cross_spawn_1.spawn)('forge-tunnel', [], {
            stdio: 'inherit',
            env: Object.assign(Object.assign({}, env), { FORGE_DEV_TUNNEL: 'true' })
        });
        if (onError) {
            process.on('error', onError);
        }
    }
    formatEnvForLocalTunnel(environment) {
        return Object.assign({}, {
            PATH: process.env.PATH || '',
            FORCE_COLOR: '1'
        }, ...environment.map(({ key, value }) => ({ [key]: value })));
    }
}
exports.LocalTunnelService = LocalTunnelService;
class DockerTunnelService extends SandboxTunnelServiceBase {
    constructor(configFilePortFindingService, cachedConfigService, dockerService, analyticsService) {
        super(configFilePortFindingService, cachedConfigService);
        this.dockerService = dockerService;
        this.analyticsService = analyticsService;
    }
    async run(tunnelOptions, creds, debugEnabled) {
        var _a;
        await this.validateDockerVersion(creds, debugEnabled);
        const startPort = 8000 + Math.round(Math.random() * 100);
        const port = await (0, portfinder_1.getPortPromise)({ port: startPort });
        const dockerOptions = await this.getDockerOptions();
        const resourcePorts = await this.configFilePortFindingService.findPorts(port);
        const cspReporterPort = await this.configFilePortFindingService.findPortAfter(Object.values(resourcePorts));
        const environment = await this.getTunnelProcessEnvironment(tunnelOptions, debugEnabled, creds, port, cspReporterPort, resourcePorts);
        const portOptions = this.getDockerPortOptions(port, resourcePorts, cspReporterPort);
        const interactiveOptions = this.getInteractiveOptions();
        const volumeOptions = this.getVolumeOptions();
        const env = this.formatEnvForDocker(environment);
        const docker = this.dockerService.runContainer([
            ...interactiveOptions,
            ...volumeOptions,
            ...portOptions,
            ...dockerOptions,
            ...env,
            exports.IMAGE_NAME
        ]);
        docker.on('exit', () => this.analyticsService.reportTunnelClosed(creds));
        (_a = docker.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (error) => {
            var _a;
            const errorMessage = error;
            let errorJson;
            try {
                errorJson = JSON.parse(errorMessage);
            }
            catch (e) {
            }
            if (errorJson && errorJson.__tunnel_error__) {
                const tunnelErrorDetails = errorJson;
                this.analyticsService.reportTunnelFailure(creds, tunnelErrorDetails.name, tunnelErrorDetails.attributes);
            }
            else {
                (_a = process.stderr) === null || _a === void 0 ? void 0 : _a.write(errorMessage);
            }
        });
        this.dockerService.startCleanupWorker([docker.pid], exports.CONTAINER_NAME);
    }
    async bootstrapDocker() {
        await this.dockerService.removeContainer(exports.CONTAINER_NAME);
        return this.dockerService.downloadImage(exports.IMAGE_NAME);
    }
    async validateDockerVersion(creds, debugEnabled) {
        const { major, minor, full } = await this.dockerService.getDockerVersion(debugEnabled);
        this.analyticsService.reportDockerVersion(creds, full);
        if (major < 17 || (major === 17 && minor < 3)) {
            throw new HiddenDockerTunnelError(true);
        }
    }
    getDockerPortOptions(port, resourcePorts, cspReporterPort) {
        const resourcePortOptions = (0, cli_shared_1.flatMap)(Object.values(resourcePorts), (resourcePort) => [
            '-p',
            `${resourcePort}:${resourcePort}`
        ]);
        const cspReporterPortOption = [];
        if (cspReporterPort) {
            cspReporterPortOption.push('-p', `${cspReporterPort}:${cspReporterPort}`);
        }
        const addHostOption = os_1.default.platform() === 'linux' ? ['--add-host', 'host.docker.internal:host-gateway'] : [];
        return [`-p`, `${port}:${port}`, ...resourcePortOptions, ...addHostOption, ...cspReporterPortOption];
    }
    formatEnvForDocker(environment) {
        return (0, cli_shared_1.flatMap)(environment, ({ key, value }) => ['--env', `${key}=${value}`]);
    }
    getInteractiveOptions() {
        if (DISABLE_TTY) {
            return [`-i`];
        }
        return [`-it`];
    }
    getVolumeOptions() {
        const options = [`-v=${process.cwd()}:/app:cached`];
        if (process.env.FORGE_DEV_DOCKER_TUNNEL) {
            const monorepoRoot = (0, path_1.join)(__dirname, '../../../..');
            options.push(`-v=${monorepoRoot}:/monorepo:cached`);
            options.push(`-v=${monorepoRoot}/node_modules/ngrok/docker-bin:/monorepo/node_modules/ngrok/bin`);
        }
        if (process.env.FORGE_TUNNEL_MOUNT_DIRECTORIES) {
            const mounts = process.env.FORGE_TUNNEL_MOUNT_DIRECTORIES.split(',');
            mounts.forEach((mount) => {
                options.push(`-v=${mount}:cached`);
            });
        }
        options.push('--mount', `type=bind,source=${this.ngrokConfigPath()},target=${PATH_DOCKER_NGROK_CONFIG}`);
        return options;
    }
    getNgrokConfigEnvironment() {
        return [{ key: 'NGROK_CONFIG', value: PATH_DOCKER_NGROK_CONFIG }];
    }
    async getDockerOptions() {
        try {
            return ['--rm', `--name`, exports.CONTAINER_NAME, '--platform', 'linux/amd64'];
        }
        catch (e) {
            throw new HiddenDockerTunnelError(false, "Couldn't populate docker options for tunneling");
        }
    }
}
exports.DockerTunnelService = DockerTunnelService;
