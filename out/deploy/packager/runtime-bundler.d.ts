import { Bundler, FunctionsEntryPoint } from '@forge/bundler';
import { Handler, Logger } from '@forge/cli-shared';
import { App } from '@forge/manifest';
import { Archiver } from './archiver';
export interface RuntimeBundleResult {
    runtimeArchivePath: string;
    moduleList?: string[];
}
export declare class RuntimeBundler {
    private readonly archiverFactory;
    private readonly logger;
    private readonly bundler;
    constructor(archiverFactory: () => Archiver, logger: Logger, bundler: Bundler<FunctionsEntryPoint>);
    protected packageCode(archiver: Archiver, entryPoints: FunctionsEntryPoint[]): Promise<string[]>;
    protected packageDependencies(archiver: Archiver): Promise<void>;
    protected packageAll(archiver: Archiver, handlers: Handler[], packageConfig: App['package']): Promise<string[]>;
    bundle(handlers: Handler[], packageConfig?: App['package']): Promise<RuntimeBundleResult>;
}
export declare class SandboxRuntimeBundler extends RuntimeBundler {
    bundle(handlers: Handler[], packageConfig?: App['package']): Promise<RuntimeBundleResult>;
}
export declare class NodeRuntimeBundler extends RuntimeBundler {
    protected packageAll(archiver: Archiver, handlers: Handler[], packageConfig: App['package']): Promise<string[]>;
}
//# sourceMappingURL=runtime-bundler.d.ts.map