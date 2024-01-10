import { AppDetails, GraphQLClient, HostedResourcePreSignedUrl } from '@forge/cli-shared';
interface HostedResourceUploadResponse {
    preSignedUrls: HostedResourcePreSignedUrl[];
    uploadId: string;
}
export interface ArtifactClient {
    getUploadUrl(appDetails: AppDetails): Promise<string>;
    getHostedResourcesUploadUrls(appDetails: AppDetails, environmentKey: string, resourceKeys: string[]): Promise<HostedResourceUploadResponse>;
}
export declare class NoDeploymentURLError extends Error {
    constructor();
}
export declare class NoPresignedUrlsError extends Error {
    constructor();
}
export declare class NoUploadIdError extends Error {
    constructor();
}
export declare class ArtifactGraphQLClient implements ArtifactClient {
    private readonly graphqlClient;
    constructor(graphqlClient: GraphQLClient);
    getUploadUrl(appDetails: AppDetails): Promise<string>;
    getHostedResourcesUploadUrls(appDetails: AppDetails, environmentKey: string, resourceKeys: string[]): Promise<HostedResourceUploadResponse>;
}
export {};
//# sourceMappingURL=artifact-graphql-client.d.ts.map