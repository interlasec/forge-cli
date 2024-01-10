"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class GraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async configureProvider(details) {
        const mutation = `
      mutation forge_cli_setExternalAuthCredentials($input: SetExternalAuthCredentialsInput!) {
        setExternalAuthCredentials(input: $input) {
          success
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
        }
      }
    `;
        const { response: { setExternalAuthCredentials: { success, errors } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                environment: {
                    appId: details.appId,
                    key: details.environment
                },
                serviceKey: details.providerKey,
                credentials: {
                    clientSecret: details.clientSecret
                }
            }
        });
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
    }
}
exports.GraphqlClient = GraphqlClient;
