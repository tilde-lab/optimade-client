import type * as Types from './types';
export { Types };
export declare class Optimade {
    private providersUrl;
    private corsProxyUrl;
    providers: Types.ProvidersMap | null;
    apis: Types.ApisMap;
    private reqStack;
    constructor({ providersUrl, corsProxyUrl }?: {
        providersUrl?: string;
        corsProxyUrl?: string;
    });
    getProviders(api?: Types.Api): Promise<Types.ProvidersMap | null>;
    getApis(provider: Types.Provider | string, version?: string): Promise<Types.Api | null>;
    getStructures(providerId: string, filter?: string, page?: number): Promise<Types.ProviderApisResponse[] | null>;
    getStructuresAll(providerIds: string[], filter?: string, page?: number, batch?: boolean): Promise<Promise<Types.StructuresResult>[]> | Promise<Types.StructuresResult>[];
    private followLinks;
    private wrapUrl;
    private isDuplicatedReq;
    static getJSON(uri: string, params?: {}, headers?: {}): Promise<any>;
    static isProviderValid(provider: Types.Provider): boolean;
    static apiVersionUrl({ attributes: { api_version, available_api_versions } }: Types.Api): any;
    static apiVersion({ data, meta }: Types.InfoResponse): Types.Api;
}
