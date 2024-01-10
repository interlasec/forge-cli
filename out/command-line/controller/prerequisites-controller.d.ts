import { CLIDetails, FeatureFlagReader, Logger } from '@forge/cli-shared';
export declare class PrerequisitesController {
    private readonly logger;
    private readonly featureFlags;
    private readonly cliDetails;
    constructor(logger: Logger, featureFlags: FeatureFlagReader, cliDetails: CLIDetails | undefined);
    check(): Promise<void>;
    private checkNodeVersion;
    private checkCustomWarning;
}
//# sourceMappingURL=prerequisites-controller.d.ts.map