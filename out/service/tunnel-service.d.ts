import { spawn } from 'cross-spawn';
import { HiddenError, PersonalApiCredentials, PersonalApiCredentialsValidated, UI, UserError } from '@forge/cli-shared';
import { StartTunnelCommand, TunnelInteractor } from '@forge/tunnel';
import { CachedConfigService } from './cached-config-service';
import { DockerService } from './docker-service';
import { ConfigFilePortFindingService } from './port-finding-service';
import { TunnelAnalyticsService } from './tunnel-analytics-service';
export interface TunnelOptions {
    debug?: boolean;
    environment?: string;
}
export declare const CONTAINER_NAME: string;
export declare const IMAGE_NAME: string;
export declare class HiddenDockerTunnelError extends HiddenError {
    private readonly userError;
    constructor(userError: boolean, message?: string);
    isUserError(): boolean;
}
export declare type TunnelService = {
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
};
export declare class DebugNotSupportedError extends UserError {
    constructor();
}
declare abstract class TunnelServiceBase implements TunnelService {
    protected readonly cachedConfigService: CachedConfigService;
    constructor(cachedConfigService: CachedConfigService);
    abstract run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
    protected ngrokConfigPath(): string;
}
export declare class InProcessTunnelService extends TunnelServiceBase {
    private readonly ui;
    private readonly startTunnelCommand;
    private readonly tunnelInteractor;
    private readonly configFilePortFindingService;
    private readonly analyticsService;
    constructor(ui: UI, startTunnelCommand: StartTunnelCommand, tunnelInteractor: TunnelInteractor, configFilePortFindingService: ConfigFilePortFindingService, cachedConfigService: CachedConfigService, analyticsService: TunnelAnalyticsService);
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
}
interface EnvironmentVariable {
    key: string;
    value: string;
}
declare abstract class SandboxTunnelServiceBase extends TunnelServiceBase {
    protected readonly configFilePortFindingService: ConfigFilePortFindingService;
    protected readonly cachedConfigService: CachedConfigService;
    constructor(configFilePortFindingService: ConfigFilePortFindingService, cachedConfigService: CachedConfigService);
    getTunnelProcessEnvironment(tunnelOptions: TunnelOptions, debugEnabled: boolean, { email, token }: PersonalApiCredentials, port: number, cspReporterPort: number | undefined, resourcePorts: Record<string, number>): Promise<EnvironmentVariable[]>;
    private getInspectorPortEnvironment;
    protected getNgrokConfigEnvironment(): EnvironmentVariable[];
    private getCspReporterPortEnvironment;
    private getResourcePortEnvironment;
    private getUserEnvironmentVariables;
}
export declare class LocalTunnelService extends SandboxTunnelServiceBase {
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
    private formatEnvForLocalTunnel;
}
export declare class DockerTunnelService extends SandboxTunnelServiceBase {
    private readonly dockerService;
    private readonly analyticsService;
    constructor(configFilePortFindingService: ConfigFilePortFindingService, cachedConfigService: CachedConfigService, dockerService: DockerService, analyticsService: TunnelAnalyticsService);
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean): Promise<void>;
    bootstrapDocker(): Promise<ReturnType<typeof spawn>>;
    private validateDockerVersion;
    private getDockerPortOptions;
    private formatEnvForDocker;
    private getInteractiveOptions;
    private getVolumeOptions;
    protected getNgrokConfigEnvironment(): EnvironmentVariable[];
    private getDockerOptions;
}
export {};
//# sourceMappingURL=tunnel-service.d.ts.map