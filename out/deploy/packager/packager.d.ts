import { Handler, Logger, ResourceDetails, UserError } from '@forge/cli-shared';
import { App } from '@forge/manifest';
import { NativeUIBundler } from './nativeui-bundler';
import { RuntimeBundler } from './runtime-bundler';
export interface PackageResult {
    runtimeArchivePath: string;
    nativeUiBundlesDetails: ResourceDetails[];
    moduleList?: string[];
}
export interface Packager {
    package(handlers: Handler[], resources: ResourceDetails[], packageConfig: App['package']): Promise<PackageResult>;
}
export declare class BundlerError extends UserError {
}
export declare class AppPackager implements Packager {
    private readonly runtimeBundler;
    private readonly nativeUiBundler;
    private readonly logger;
    constructor(runtimeBundler: RuntimeBundler, nativeUiBundler: NativeUIBundler, logger: Logger);
    package(handlers: Handler[], resources: ResourceDetails[], packageConfig: App['package']): Promise<PackageResult>;
}
//# sourceMappingURL=packager.d.ts.map