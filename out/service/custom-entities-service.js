"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEntitiesService = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const list_indexes_1 = require("../entities/list-indexes");
class CustomEntitiesService {
    constructor(appConfigProvider, appOauthClient, entitiesGraphqlClient) {
        this.appConfigProvider = appConfigProvider;
        this.appOauthClient = appOauthClient;
        this.entitiesGraphqlClient = entitiesGraphqlClient;
    }
    sortTransformedIndexes(transformedIndexes) {
        transformedIndexes.sort((index1, index2) => {
            if (index1.indexStatus > index2.indexStatus) {
                return -1;
            }
            else if (index1.indexStatus < index2.indexStatus) {
                return 1;
            }
            else {
                return 0;
            }
        });
        return transformedIndexes;
    }
    async listEntitiesIndexes(environment) {
        var _a;
        const { id: appId } = await this.appConfigProvider();
        const { environmentId, oauthClientId } = await this.appOauthClient.getAppOauthClientIdDetails(appId, environment);
        const results = await this.entitiesGraphqlClient.getEntitiesDefinitions(oauthClientId);
        const transformedIndexes = [];
        const indexesToExclude = ['by-context-ari'];
        for (const entity of results) {
            const [, , , ...entityName] = entity.name.split('_');
            const transformedIndexesPerEntity = [];
            let byKeyIndex = {};
            for (const index of (_a = entity.indexes) !== null && _a !== void 0 ? _a : []) {
                if (indexesToExclude.indexOf(index.name) < 0) {
                    if (index.name === 'by-key') {
                        byKeyIndex = {
                            entityName: entityName.join('_'),
                            indexName: index.name.concat(' (default)'),
                            indexStatus: index.status,
                            partition: index.partition.length ? index.partition.join(', ') : 'None',
                            range: 'key (data key)'
                        };
                    }
                    else {
                        transformedIndexesPerEntity.push({
                            entityName: entityName.join('_'),
                            indexName: index.name,
                            indexStatus: index.status,
                            partition: index.partition.length ? index.partition.join(', ') : 'None',
                            range: index.range.length ? index.range.join(', ') : 'None'
                        });
                    }
                }
            }
            this.sortTransformedIndexes(transformedIndexesPerEntity);
            transformedIndexesPerEntity.push(byKeyIndex);
            transformedIndexes.push(...transformedIndexesPerEntity);
        }
        return {
            appId,
            environmentId,
            oauthClientId,
            indexes: transformedIndexes
        };
    }
    async isReindexingInProgress(environment) {
        const { indexes: indexes } = await this.listEntitiesIndexes((0, cli_shared_1.optionToEnvironment)(environment || 'development'));
        const indexStatuses = indexes.map((index) => index.indexStatus);
        return indexStatuses.includes(list_indexes_1.CustomEntityIndexStatus.CREATING);
    }
}
exports.CustomEntitiesService = CustomEntitiesService;
