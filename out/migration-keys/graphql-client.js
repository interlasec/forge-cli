"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class GraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async getLatestMigrationKeys(appId, environmentKey) {
        var _a, _b;
        const marketplaceQuery = (0, cli_shared_1.getEnvironment)() == 'fex' ? '' : 'marketplaceApp { appKey }';
        const query = `
          query forge_cli_getMigrationKeys($id: ID!, $key: String!) {
            app(id: $id) {
              environmentByKey(key: $key) {
                id
                versions(first: 1) {
                  edges {
                    node {
                      isLatest
                      migrationKeys {
                        jira
                        confluence
                      }
                    }
                  }
                }
              }
              ${marketplaceQuery}
            }
          }
     `;
        const result = await this.graphqlClient.query(query, {
            id: appId,
            key: environmentKey
        });
        if (!result.app) {
            throw new cli_shared_1.MissingAppError();
        }
        if (!result.app.environmentByKey) {
            throw new cli_shared_1.MissingAppEnvironmentError(environmentKey);
        }
        const mpacAppKey = (_a = result.app.marketplaceApp) === null || _a === void 0 ? void 0 : _a.appKey;
        const versions = result.app.environmentByKey.versions;
        let migrationKeys;
        for (const edge of (versions === null || versions === void 0 ? void 0 : versions.edges) || []) {
            if (edge) {
                migrationKeys = (_b = edge.node) === null || _b === void 0 ? void 0 : _b.migrationKeys;
            }
        }
        return { migrationKeys, mpacAppKey };
    }
}
exports.GraphqlClient = GraphqlClient;
