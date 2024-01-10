"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = exports.MissingAppError = exports.APP_HAS_INSTALLATIONS_CODE = void 0;
const cli_shared_1 = require("@forge/cli-shared");
exports.APP_HAS_INSTALLATIONS_CODE = 'APP_HAS_INSTALLATIONS';
class MissingAppError extends cli_shared_1.UserError {
}
exports.MissingAppError = MissingAppError;
class GraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async createEnvironment(details) {
        const mutation = `
      mutation forge_cli_createEnvironment($input: CreateAppEnvironmentInput!) {
        ecosystem {
          createAppEnvironment(input: $input) {
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
      }
    `;
        const { response: { ecosystem: { createAppEnvironment } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                appAri: details.appId,
                environmentKey: details.environmentKey,
                environmentType: cli_shared_1.AppEnvironmentType.Development
            }
        });
        if (!createAppEnvironment) {
            throw new cli_shared_1.GraphQlMutationError(`Unable to get a response (requestId: ${requestId || 'unknown'})`, { requestId });
        }
        const { success, errors } = createAppEnvironment;
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
    }
    async listEnvironment(details) {
        const query = `
      query forge_cli_listEnvironment($id: ID!) {
        app(id: $id) {
          environments {
            key
            type
            createdAt
            versions(first: 1) {
              nodes {
                updatedAt
              }
            }
          }
        }
      }
    `;
        const { app } = await this.graphqlClient.query(query, {
            id: details.appId
        });
        if (!app) {
            throw new MissingAppError();
        }
        return app.environments.map((environment) => {
            var _a, _b, _c;
            return {
                type: environment.type,
                key: environment.key,
                lastDeployedAt: ((_c = (_b = (_a = environment.versions) === null || _a === void 0 ? void 0 : _a.nodes) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.updatedAt) || environment.createdAt
            };
        });
    }
    async deleteEnvironments(details) {
        const results = [];
        for (const environmentKey of details.environmentKeys) {
            try {
                const success = await this.deleteEnvironment(Object.assign(Object.assign({}, details), { environmentKey }));
                results.push({ environmentKey, successful: success });
            }
            catch (err) {
                results.push({ environmentKey, successful: false, error: err });
            }
        }
        return results;
    }
    async deleteEnvironment(details) {
        const mutation = `
      mutation forge_cli_deleteEnvironment($input: DeleteAppEnvironmentInput!) {
        ecosystem {
          deleteAppEnvironment(input: $input) {
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
      }
    `;
        const { response: { ecosystem: { deleteAppEnvironment } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                appAri: details.appId,
                environmentKey: details.environmentKey
            }
        });
        if (!deleteAppEnvironment) {
            throw new cli_shared_1.GraphQlMutationError(`Unable to get a response (requestId: ${requestId || 'unknown'})`, {
                requestId
            });
        }
        const { success, errors } = deleteAppEnvironment;
        const error = (0, cli_shared_1.getError)(errors);
        let errorMessage = error.message;
        if (error.code === exports.APP_HAS_INSTALLATIONS_CODE) {
            errorMessage = cli_shared_1.Text.deleteEnvironment.hasInstallationError(details.environmentKey);
        }
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${errorMessage} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
        return success;
    }
}
exports.GraphqlClient = GraphqlClient;
