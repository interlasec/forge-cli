"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLintService = void 0;
const lint_1 = require("@forge/lint");
const manifest_1 = require("@forge/manifest");
class LiteLintService {
    constructor(lintService = lint_1.litelint, problemCounter = lint_1.problemCount) {
        this.lintService = lintService;
        this.problemCounter = problemCounter;
    }
    async run(checkSchema, logger) {
        const report = await this.lintService(logger);
        return this.filterResults(report, checkSchema);
    }
    filterResults(report, checkSchema) {
        return checkSchema
            ? report
            : report.map((r) => {
                r.errors = r.errors.filter((e) => e.reference !== manifest_1.References.SchemaError);
                return r;
            });
    }
    hasErrors(report) {
        return this.problemCounter(report).errors > 0;
    }
}
exports.LiteLintService = LiteLintService;
