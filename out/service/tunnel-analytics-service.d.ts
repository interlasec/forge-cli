import { PersonalApiCredentialsValidated, CLIDetails } from '@forge/cli-shared';
import { AnalyticsClientReporter } from '../analytics-client/analytics-client';
import { DownloadProgressCallbacks } from '../command-line/view/tunnel-view';
export declare class TunnelAnalyticsService {
    private readonly analyticsClientReporter;
    private readonly cliDetails;
    constructor(analyticsClientReporter: AnalyticsClientReporter, cliDetails: CLIDetails | undefined);
    reportDockerVersion(creds: PersonalApiCredentialsValidated, dockerVersion: string | null): void;
    reportTunnelClosed(creds: PersonalApiCredentialsValidated): void;
    reportTunnelFailure(creds: PersonalApiCredentialsValidated, errorName: string, attributes: {
        [key: string]: any;
    }): void;
    getImageDownloadReporters(creds: PersonalApiCredentialsValidated): DownloadProgressCallbacks;
}
//# sourceMappingURL=tunnel-analytics-service.d.ts.map