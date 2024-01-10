"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const didyoumean_1 = tslib_1.__importDefault(require("didyoumean"));
class CommandSuggestionService {
    getSuggestions(input, list) {
        const set = [...list, ...list.map((item) => item.split(':')[0])];
        const result = set.filter((search) => search.includes(input));
        const dym = (0, didyoumean_1.default)(input, set);
        if (dym) {
            result.push(dym);
            result.push(...set.filter((search) => search.includes(dym)));
        }
        const suggestions = list.filter((item) => result.includes(item));
        suggestions.sort();
        return suggestions;
    }
}
exports.default = CommandSuggestionService;
