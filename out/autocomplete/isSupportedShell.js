"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedShell = void 0;
function isSupportedShell() {
    const shell = process.env.SHELL;
    if (!shell) {
        return false;
    }
    return /bash/.test(shell) || /zsh/.test(shell) || /fish/.test(shell);
}
exports.isSupportedShell = isSupportedShell;
