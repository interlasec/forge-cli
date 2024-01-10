import { InDiskBundler } from '@forge/bundler';
import { Logger, ResourceDetails } from '@forge/cli-shared';
export interface NativeUIBundleResult {
    nativeUiBundlesDetails: ResourceDetails[];
}
export declare class NativeUIBundler {
    private readonly logger;
    private readonly bundler;
    constructor(logger: Logger, bundler: InDiskBundler);
    bundle(resources: ResourceDetails[]): Promise<NativeUIBundleResult>;
}
//# sourceMappingURL=nativeui-bundler.d.ts.map