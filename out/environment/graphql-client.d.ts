import { AppEnvironmentType, GraphQLClient, UserError } from '@forge/cli-shared';
import { AppEnvironmentDetails, CreateEnvironmentClient } from './create-environment';
import { ListEnvironmentClient, ListEnvironmentDetails } from './list-environment';
import { BatchDeleteEnvironmentDetails, DeleteEnvironmentClient, DeleteEnvironmentDetails, DeleteEnvironmentOutput } from './delete-environment';
export declare const APP_HAS_INSTALLATIONS_CODE = "APP_HAS_INSTALLATIONS";
export declare class MissingAppError extends UserError {
}
export declare class GraphqlClient implements CreateEnvironmentClient, ListEnvironmentClient, DeleteEnvironmentClient {
    private readonly graphqlClient;
    constructor(graphqlClient: GraphQLClient);
    createEnvironment(details: AppEnvironmentDetails): Promise<void>;
    listEnvironment(details: ListEnvironmentDetails): Promise<{
        type: AppEnvironmentType;
        key: string;
        lastDeployedAt: string;
    }[]>;
    deleteEnvironments(details: BatchDeleteEnvironmentDetails): Promise<DeleteEnvironmentOutput[]>;
    deleteEnvironment(details: DeleteEnvironmentDetails): Promise<true>;
}
//# sourceMappingURL=graphql-client.d.ts.map