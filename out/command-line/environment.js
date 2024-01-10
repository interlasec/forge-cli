"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvironmentOption = exports.validateDevEnvironment = exports.validateEnvironmentOption = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const ENVIRONMENT_KEY_PATTERN = /^[a-zA-Z0-9-_]+$/;
const validateEnvironmentOption = (userValue) => {
    if (!ENVIRONMENT_KEY_PATTERN.test(userValue)) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.env.invalid);
    }
    return userValue;
};
exports.validateEnvironmentOption = validateEnvironmentOption;
const validateDevEnvironment = (userValue) => {
    if ([cli_shared_1.STAGING_ENVIRONMENT_KEY, cli_shared_1.PRODUCTION_ENVIRONMENT_KEY].includes(userValue)) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.env.developmentOnly(userValue));
    }
    return userValue;
};
exports.validateDevEnvironment = validateDevEnvironment;
const checkEnvironmentOption = (userValue) => {
    return (0, cli_shared_1.optionToEnvironment)((0, exports.validateEnvironmentOption)(userValue));
};
exports.checkEnvironmentOption = checkEnvironmentOption;
