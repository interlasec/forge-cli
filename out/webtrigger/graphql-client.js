"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebTriggerGraphQLClient = exports.MissingWebTriggerUrlError = exports.WebTriggerCreationError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class WebTriggerCreationError extends cli_shared_1.GraphQlMutationError {
    constructor(message, requestId, code) {
        super(cli_shared_1.Text.webtrigger.error.creationError(message), { requestId, code });
    }
}
exports.WebTriggerCreationError = WebTriggerCreationError;
class MissingWebTriggerUrlError extends cli_shared_1.GraphQlMutationError {
    constructor(requestId) {
        super(cli_shared_1.Text.webtrigger.error.creationError(`Web Trigger URL not found after successful creation, requestId: ${requestId !== null && requestId !== void 0 ? requestId : 'N/A'}`), { requestId });
    }
}
exports.MissingWebTriggerUrlError = MissingWebTriggerUrlError;
class WebTriggerGraphQLClient {
    constructor(graphQLClient) {
        this.graphQLClient = graphQLClient;
    }
    async createWebTriggerUrl({ appId, contextId, environmentId, triggerKey }) {
        const query = `
        mutation forge_cli_createWebTriggerUrl($input: WebTriggerUrlInput!) {
            createWebTriggerUrl(input: $input) {
            statusCode
            success
            message
            url
            }
        }
        `;
        const variables = {
            input: {
                appId,
                contextId,
                envId: environmentId,
                triggerKey
            }
        };
        const { response: { createWebTriggerUrl: { success, statusCode, message, url } }, requestId } = await this.graphQLClient.mutate(query, variables);
        if (!success) {
            throw new WebTriggerCreationError(message, requestId, statusCode.toString());
        }
        else {
            if (url) {
                return url;
            }
            throw new MissingWebTriggerUrlError(requestId);
        }
    }
}
exports.WebTriggerGraphQLClient = WebTriggerGraphQLClient;
