/// <reference types="node" />
import { ConfigFile, FileSystemReader } from '@forge/cli-shared';
import { LintFixState, LintResult, LintLogger, ProblemCount } from '@forge/lint';
interface LintOptions {
    fix?: boolean;
}
interface RunResult {
    lintResults: LintResult[];
    fixResults?: LintFixState;
}
export declare const DEFAULT_DIRECTORY = "./src";
export declare class LintService {
    private readonly configFile;
    private readonly fileSystemReader;
    constructor(configFile: ConfigFile, fileSystemReader: FileSystemReader);
    run(environment: string, { fix }: LintOptions, logger: LintLogger, directory?: string, lintFunction?: (filesToLint: string[], manifest: import("@forge/manifest").ManifestSchema, environment: string, logger: LintLogger, parseFunction?: ((filepath: string, parser: (code: string, filepath: string, parseOptions?: Partial<import("@forge/lint").ParseOptions> | undefined) => Promise<import("@forge/lint").ASTParseResult>, readFilePromise?: typeof import("fs").readFile.__promisify__ | undefined) => Promise<import("@forge/lint").LintInput>) | undefined, linters?: import("@forge/lint").LinterInterface[] | undefined) => Promise<LintResult[]>): Promise<RunResult>;
    private fix;
    problemCount(lintResults: LintResult[]): ProblemCount;
    private failedScopesFromLintResult;
    failedScopes(lintResults: LintResult[]): string[];
}
export {};
//# sourceMappingURL=lint-service.d.ts.map