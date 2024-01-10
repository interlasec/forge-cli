import { CommandLineUI, ConfigFile, PersonalApiCredentialsValidated } from '@forge/cli-shared';
import { TunnelAnalyticsService } from '../../service/tunnel-analytics-service';
import { DockerTunnelService, TunnelOptions, TunnelService } from '../../service/tunnel-service';
import { TunnelView } from '../view/tunnel-view';
export declare class TunnelController {
    private readonly analyticsService;
    private readonly nodeTunnelService;
    private readonly localTunnelService;
    private readonly dockerTunnelService;
    private readonly tunnelView;
    private readonly configFile;
    constructor(analyticsService: TunnelAnalyticsService, nodeTunnelService: TunnelService, localTunnelService: TunnelService, dockerTunnelService: DockerTunnelService, tunnelView: TunnelView, configFile: ConfigFile);
    run(tunnelOptions: TunnelOptions, ui: CommandLineUI): Promise<void>;
    runDockerTunnel(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean): Promise<void>;
}
//# sourceMappingURL=tunnel-controller.d.ts.map