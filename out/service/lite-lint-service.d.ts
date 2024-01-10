import { LintLogger, LintResult } from '@forge/lint';
export declare class LiteLintService {
    private readonly lintService;
    private readonly problemCounter;
    constructor(lintService?: (logger: LintLogger, linter?: import("@forge/lint").LinterInterface | undefined) => Promise<LintResult[]>, problemCounter?: (lintResults: LintResult[]) => import("@forge/lint").ProblemCount);
    run(checkSchema: boolean, logger: LintLogger): Promise<LintResult[]>;
    private filterResults;
    hasErrors(report: LintResult[]): boolean;
}
//# sourceMappingURL=lite-lint-service.d.ts.map