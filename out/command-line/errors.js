"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAbortError = exports.DeferredErrors = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class DeferredErrors {
    constructor(errors) {
        this.errors = errors;
    }
    getErrors() {
        return this.errors;
    }
}
exports.DeferredErrors = DeferredErrors;
class UserAbortError extends cli_shared_1.HiddenError {
    constructor() {
        super();
    }
    isUserError() {
        return true;
    }
}
exports.UserAbortError = UserAbortError;
