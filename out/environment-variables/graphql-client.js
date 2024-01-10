"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = exports.MissingAppEnvironmentError = exports.MissingAppError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class MissingAppError extends cli_shared_1.UserError {
}
exports.MissingAppError = MissingAppError;
class MissingAppEnvironmentError extends Error {
}
exports.MissingAppEnvironmentError = MissingAppEnvironmentError;
class GraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async listEnvironmentVariables(details) {
        const query = `
      query forge_cli_getAppEnvironmentVariables($appId: ID!, $key: String!) {
        app(id: $appId) {
          name
          description
          environmentByKey(key: $key) {
            id
            variables {
              key
              value
              encrypt
            }
          }
        }
      }
    `;
        const result = await this.graphqlClient.query(query, {
            appId: details.appId,
            key: details.environment
        });
        if (!result.app) {
            throw new MissingAppError();
        }
        if (!result.app.environmentByKey) {
            throw new MissingAppEnvironmentError();
        }
        return result.app.environmentByKey.variables;
    }
    async setEnvironmentVariable(details) {
        const mutation = `
      mutation forge_cli_setAppEnvironmentVariable($input: SetAppEnvironmentVariableInput!) {
        setAppEnvironmentVariable(input: $input) {
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
        const { response: { setAppEnvironmentVariable: { success, errors } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                environment: {
                    appId: details.appId,
                    key: details.environment
                },
                environmentVariable: {
                    key: details.key,
                    value: details.value,
                    encrypt: details.encrypt
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
    async deleteEnvironmentVariable(details) {
        const mutation = `
      mutation forge_cli_deleteAppEnvironmentVariable($input: DeleteAppEnvironmentVariableInput!) {
        deleteAppEnvironmentVariable(input: $input) {
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
        const { response: { deleteAppEnvironmentVariable: { success, errors } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                environment: {
                    appId: details.appId,
                    key: details.environment
                },
                key: details.key
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
