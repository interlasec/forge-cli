"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerDeployGraphQLClient = exports.NoDeploymentError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class NoDeploymentError extends Error {
    constructor() {
        super(cli_shared_1.Text.deploy.error.notFound);
    }
}
exports.NoDeploymentError = NoDeploymentError;
class TriggerDeployGraphQLClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async deploy(deploymentDetails) {
        const deployAppQuery = `
      mutation forge_cli_deployApplication($input: CreateAppDeploymentInput!) {
        createAppDeployment(input: $input) {
          success
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
          deployment {
            id
          }
        }
      }
    `;
        const { response: { createAppDeployment: { deployment, success, errors } }, requestId } = await this.graphqlClient.mutate(deployAppQuery, {
            input: deploymentDetails
        });
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
        if (!deployment) {
            throw new NoDeploymentError();
        }
        return deployment.id;
    }
}
exports.TriggerDeployGraphQLClient = TriggerDeployGraphQLClient;
