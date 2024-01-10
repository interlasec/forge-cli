"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesGraphqlClient = void 0;
class EntitiesGraphqlClient {
    constructor(graphQLClient) {
        this.graphQLClient = graphQLClient;
    }
    async getEntitiesDefinitions(oauthClientId) {
        var _a;
        const query = `
      query forge_cli_getAppOauthClientIdDetails($oauthClientId: String!) {
        ersLifecycle {
          doneEntitiesFromERS(
            oauthClientId: $oauthClientId
          ) {
            indexes {
              name
              partition
              range
              status
            }
            name
            status
          }
        }
      }
    `;
        const result = await this.graphQLClient.query(query, {
            oauthClientId
        });
        return ((_a = result === null || result === void 0 ? void 0 : result.ersLifecycle) === null || _a === void 0 ? void 0 : _a.doneEntitiesFromERS) || [];
    }
}
exports.EntitiesGraphqlClient = EntitiesGraphqlClient;
