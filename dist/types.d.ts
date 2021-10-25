export interface Meta {
    api_version: string;
    query: {
        representation: string;
    };
    data_returned: number;
    data_available: number;
    more_data_available: boolean;
    implementation?: {
        maintainer: {
            email: string;
        };
        name: string;
        source_url: string;
        version: string;
    };
    provider?: {
        name: string;
        description: string;
        prefix: string;
    };
    pages?: number;
    limits?: number[];
}
export interface Links {
    base_url: string;
    first?: {
        href: string;
    };
    next?: {
        href: string;
    };
}
export interface ApiVer {
    url?: string;
    version?: string;
    [key: string]: string;
}
export interface Api {
    id: string;
    type: string;
    attributes: {
        api_version: string;
        available_api_versions: ApiVer | ApiVer[];
        available_endpoints: string[];
        entry_types_by_format: {};
        formats: string[];
    };
}
export interface Provider {
    type: string;
    id: string;
    attributes: {
        name: string;
        description: string;
        base_url: string | null;
        homepage?: string | null;
        link_type?: string;
        query_limits?: number[];
    };
}
export interface Structure {
    type: string;
    id: string;
    attributes: {
        chemical_formula_hill?: string;
        chemical_formula_reduced?: string;
        _tcod_unreduced_formula?: string;
        chemical_formula_descriptive?: string;
        [key: string]: any;
    };
}
export interface ProviderApisResponse {
    data: Structure[];
    meta?: {
        version: string;
        available: number;
        returned: number;
        more: boolean;
        query: string;
        limit: number;
        pages: number;
    };
}
export interface ProvidersResponse {
    data: Provider[];
    meta?: Meta;
}
export interface InfoResponse {
    data: Api | Api[];
    links?: Links;
    meta?: Meta;
    [key: string]: any;
}
export interface StructuresResponse {
    data?: Structure[];
    links?: Links;
    meta?: Meta;
}
export interface LinksResponse {
    data: Structure[];
    links?: Links;
    meta?: Meta;
}
export interface ResponseError extends Error {
    response?: any;
}
export interface ErrorObject {
    status: string;
    title: string;
    detail?: string;
    length?: string;
}
export interface ErrorResponse {
    errors: any;
    meta: any;
}
export declare type ProvidersMap = {
    [key: string]: Provider;
};
export declare type ApisMap = {
    [key: string]: Api[];
};
export declare type StructuresResult = [Promise<ProviderApisResponse[]>, Promise<Provider>][];
