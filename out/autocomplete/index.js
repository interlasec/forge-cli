"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autocomplete = exports.processAutocompleteFactory = void 0;
const tslib_1 = require("tslib");
const omelette_1 = tslib_1.__importDefault(require("omelette"));
const autocomplete_config_json_1 = tslib_1.__importDefault(require("./autocomplete-config.json"));
const util_1 = require("./util");
const autocompleteConfig = autocomplete_config_json_1.default;
const processAutocompleteFactory = (autocompleteConfig) => {
    const processAutocomplete = (_, { line, reply }) => {
        var _a;
        const splitLine = line.split(' ');
        const numArgs = splitLine.length;
        if (numArgs === 2) {
            if (splitLine.slice(-1)[0].startsWith('-')) {
                reply(Object.keys(autocompleteConfig.options));
                return;
            }
            reply(Object.keys(autocompleteConfig.commands));
        }
        else {
            const command = splitLine[1];
            if (!autocompleteConfig.commands.hasOwnProperty(command)) {
                return;
            }
            const commandOptions = autocompleteConfig.commands[command];
            const lastArg = splitLine.slice(-2, -1)[0];
            if ((_a = commandOptions[lastArg]) === null || _a === void 0 ? void 0 : _a.requireUserArg) {
                return;
            }
            const userOptionsSelected = (0, util_1.getUserOptionsSelectedFromSplitLine)(splitLine);
            const remainingOptions = (0, util_1.getRemainingOptions)(commandOptions, userOptionsSelected);
            reply(Object.keys(remainingOptions));
        }
    };
    return processAutocomplete;
};
exports.processAutocompleteFactory = processAutocompleteFactory;
exports.autocomplete = (0, omelette_1.default)(process.env.AUTOCOMPLETE_ALIAS || 'forge');
exports.autocomplete.on('complete', (0, exports.processAutocompleteFactory)(autocompleteConfig));
exports.autocomplete.init();
