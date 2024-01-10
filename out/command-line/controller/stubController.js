"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubController = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class StubCommandError extends cli_shared_1.UserError {
    constructor(oldName, newName) {
        super(cli_shared_1.Text.stub.error(newName, oldName));
    }
}
class StubController {
    async run({ oldName, newName }) {
        throw new StubCommandError(oldName, newName);
    }
}
exports.StubController = StubController;
