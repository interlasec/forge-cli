"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintController = void 0;
class LintController {
    constructor(lintService, lintView) {
        this.lintService = lintService;
        this.lintView = lintView;
    }
    async run(environment, fix) {
        !fix && this.lintView.showBlurb();
        const runResult = await this.lintService.run(environment, { fix }, this.lintView.getLogger());
        if (runResult === null || runResult === void 0 ? void 0 : runResult.fixResults) {
            this.lintView.reportFixResult(runResult.fixResults);
        }
        else {
            this.lintView.reportLintResult(runResult.lintResults);
        }
    }
}
exports.LintController = LintController;
