"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemainingOptions = exports.getUserOptionsSelectedFromSplitLine = void 0;
const getUserOptionsSelectedFromSplitLine = (splitLine) => {
    return splitLine.slice(2).filter((o) => o.startsWith('--'));
};
exports.getUserOptionsSelectedFromSplitLine = getUserOptionsSelectedFromSplitLine;
const getRemainingOptions = (commandOptions, userSelectedOptions) => {
    const commandOptionsClone = Object.assign({}, commandOptions);
    for (const option of userSelectedOptions) {
        delete commandOptionsClone[option];
    }
    return commandOptionsClone;
};
exports.getRemainingOptions = getRemainingOptions;
