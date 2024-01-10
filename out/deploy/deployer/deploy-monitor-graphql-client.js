"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployMonitorGraphqlClient = void 0;
const trigger_deploy_graphql_client_1 = require("./trigger-deploy-graphql-client");
class DeployMonitorGraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async getDeployment({ appId, environmentKey, deploymentId }) {
        const { appDeployment, requestId } = await this.graphqlClient.query(`
        query forge_cli_getApplicationDeploymentStatus($appId: ID!, $environmentKey: String!, $id: ID!) {
          appDeployment(appId: $appId, environmentKey: $environmentKey, id: $id) {
            status
            errorDetails {
              code
              message
              fields
            }
            stages {
              description
              events {
                __typename
                stepName
                createdAt
                ...on AppDeploymentLogEvent {
                  message
                  level
                }
                ...on AppDeploymentSnapshotLogEvent {
                  message
                  level
                }
                ... on AppDeploymentTransitionEvent {
                  newStatus
                }
              }
            }
          }
        }
      `, {
            appId,
            environmentKey,
            id: deploymentId
        });
        if (!appDeployment) {
            throw new trigger_deploy_graphql_client_1.NoDeploymentError();
        }
        return Object.assign(Object.assign({}, appDeployment), { requestId });
    }
}
exports.DeployMonitorGraphqlClient = DeployMonitorGraphqlClient;
