"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLintView = void 0;
const lint_1 = require("@forge/lint");
class LiteLintView {
    constructor(ui, reporter = lint_1.reportLintResults) {
        this.ui = ui;
        this.reporter = reporter;
    }
    reportErrors(report) {
        this.ui.emptyLine();
        this.reporter(this.ui, report, false);
    }
    getLogger() {
        return this.ui;
    }
}
exports.LiteLintView = LiteLintView;
