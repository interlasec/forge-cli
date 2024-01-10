import * as Sentry from '@sentry/node';
import { CLIDetails } from '@forge/cli-shared';
import { CachedConfigService } from '../service/cached-config-service';
export declare function initialiseSentry({ cliDetails, cachedConfigService, options }: {
    cliDetails: Pick<CLIDetails, 'version'> | undefined;
    cachedConfigService: Pick<CachedConfigService, 'getAnalyticsPreferences'>;
    options?: Partial<Sentry.NodeOptions>;
}): void;
export declare function setSentryEnvFlags(accountId: string, appId: string): Promise<void>;
export declare function setSentryCmdOptFlags(command: string, options: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=sentry.d.ts.map