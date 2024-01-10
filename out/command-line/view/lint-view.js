"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintView = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const lint_1 = require("@forge/lint");
class LintView {
    constructor(ui, lintResultReporter = lint_1.reportLintResults) {
        this.ui = ui;
        this.lintResultReporter = lintResultReporter;
    }
    reportLintResult(results) {
        this.lintResultReporter(this.ui, results);
    }
    reportFixResult(result) {
        if (!result.errorsFixed && !result.warningsFixed) {
            this.ui.info(cli_shared_1.LogColor.trace(cli_shared_1.Text.lint.noProblems));
        }
        else {
            this.ui.info(cli_shared_1.Text.lint.fixed(result.errorsFixed, result.warningsFixed));
            this.ui.info('');
            this.ui.info(cli_shared_1.Text.lint.fixFollowUp);
        }
    }
    getLogger() {
        return this.ui;
    }
    showBlurb() {
        this.ui.info(cli_shared_1.Text.lint.blurb);
    }
}
exports.LintView = LintView;
