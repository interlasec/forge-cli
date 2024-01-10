"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteController = exports.assertNodeVersionSupported = exports.Argument = void 0;
const tslib_1 = require("tslib");
const semver_1 = tslib_1.__importDefault(require("semver"));
const cli_shared_1 = require("@forge/cli-shared");
const autocomplete_1 = require("../../autocomplete");
const assertUnreachable_1 = require("./assertUnreachable");
const getNodeVersion_1 = require("./getNodeVersion");
var Argument;
(function (Argument) {
    Argument["install"] = "install";
    Argument["uninstall"] = "uninstall";
})(Argument = exports.Argument || (exports.Argument = {}));
function assertIsValidArgument(arg) {
    if (!(arg in Argument)) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.autocomplete.error.badArg(arg));
    }
}
function assertNodeVersionSupported(version = (0, getNodeVersion_1.getNodeVersion)()) {
    if (semver_1.default.eq(version, '12.5.0') || semver_1.default.eq(version, '12.6.0')) {
        throw new Error(cli_shared_1.Text.autocomplete.error.unsupportedNodeVersion);
    }
}
exports.assertNodeVersionSupported = assertNodeVersionSupported;
class AutocompleteController {
    constructor(ui) {
        this.ui = ui;
    }
    async run(arg) {
        assertIsValidArgument(arg);
        if (arg === Argument.install) {
            assertNodeVersionSupported();
            if (!(await this.ui.confirm(cli_shared_1.Text.autocomplete.confirmInstalling))) {
                return;
            }
            this.ui.info(cli_shared_1.Text.autocomplete.installing);
            try {
                autocomplete_1.autocomplete.setupShellInitFile();
            }
            catch (e) {
                throw new Error(cli_shared_1.Text.autocomplete.error.unsupportedShell);
            }
        }
        else if (arg === Argument.uninstall) {
            this.ui.info(cli_shared_1.Text.autocomplete.uninstalling);
            autocomplete_1.autocomplete.cleanupShellInitFile();
        }
        else {
            (0, assertUnreachable_1.assertUnreachable)(arg);
        }
    }
}
exports.AutocompleteController = AutocompleteController;
