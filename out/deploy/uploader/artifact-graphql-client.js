"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactGraphQLClient = exports.NoUploadIdError = exports.NoPresignedUrlsError = exports.NoDeploymentURLError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class NoDeploymentURLError extends Error {
    constructor() {
        super(cli_shared_1.Text.artifact.error.noDeployUrl);
    }
}
exports.NoDeploymentURLError = NoDeploymentURLError;
class NoPresignedUrlsError extends Error {
    constructor() {
        super(cli_shared_1.Text.artifact.error.noPresignedUrls);
    }
}
exports.NoPresignedUrlsError = NoPresignedUrlsError;
class NoUploadIdError extends Error {
    constructor() {
        super(cli_shared_1.Text.artifact.error.noUploadId);
    }
}
exports.NoUploadIdError = NoUploadIdError;
class ArtifactGraphQLClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async getUploadUrl(appDetails) {
        const artifactQuery = `
      mutation forge_cli_getDeploymentUrl($input: CreateAppDeploymentUrlInput!) {
        createAppDeploymentUrl(input: $input) {
          success
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
          deploymentUrl
        }
      }
    `;
        const { response: { createAppDeploymentUrl: { deploymentUrl, success, errors } }, requestId } = await this.graphqlClient.mutate(artifactQuery, {
            input: {
                appId: appDetails.id
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
        if (!deploymentUrl) {
            throw new NoDeploymentURLError();
        }
        return deploymentUrl;
    }
    async getHostedResourcesUploadUrls(appDetails, environmentKey, resourceKeys) {
        const artifactQuery = `
      mutation forge_cli_getHostedResourcesUploadUrls($input: CreateHostedResourceUploadUrlInput!) {
        createHostedResourceUploadUrl(input: $input) {
          success
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
          preSignedUrls {
            uploadUrl
            uploadFormData
          }
          uploadId
        }
      }
  `;
        const { response: { createHostedResourceUploadUrl: { preSignedUrls, success, errors, uploadId } }, requestId } = await this.graphqlClient.mutate(artifactQuery, {
            input: {
                appId: appDetails.id,
                environmentKey,
                resourceKeys
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
        if (!preSignedUrls) {
            throw new NoPresignedUrlsError();
        }
        return { preSignedUrls, uploadId };
    }
}
exports.ArtifactGraphQLClient = ArtifactGraphQLClient;
