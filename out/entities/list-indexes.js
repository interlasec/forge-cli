"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEntitiesIndexesCommand = exports.CustomEntityIndexStatus = void 0;
var CustomEntityIndexStatus;
(function (CustomEntityIndexStatus) {
    CustomEntityIndexStatus["ACTIVE"] = "ACTIVE";
    CustomEntityIndexStatus["CREATING"] = "CREATING";
})(CustomEntityIndexStatus = exports.CustomEntityIndexStatus || (exports.CustomEntityIndexStatus = {}));
class ListEntitiesIndexesCommand {
    constructor(customEntitiesService) {
        this.customEntitiesService = customEntitiesService;
    }
    async execute(environment) {
        return await this.customEntitiesService.listEntitiesIndexes(environment);
    }
}
exports.ListEntitiesIndexesCommand = ListEntitiesIndexesCommand;
