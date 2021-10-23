
import { allSettled, fetchWithTimeout } from './utils';

import type * as Types from './types';
export { Types };

export class Optimade {
    private providersUrl: string = '';
    private corsProxyUrl: string = '';
    providers: Types.ProvidersMap | null = null;
    apis: Types.ApisMap = {};
    private reqStack: string[] = [];

    constructor({ providersUrl = '', corsProxyUrl = '' }: { providersUrl?: string; corsProxyUrl?: string; } = {}) {
        this.corsProxyUrl = corsProxyUrl;
        this.providersUrl = this.wrapUrl(providersUrl);
    }

    async getProviders(api?: Types.Api): Promise<Types.ProvidersMap | null> {
        const providers: Types.ProvidersResponse | null = await (api ?
            this.followLinks(api).catch(() => null) :
            Optimade.getJSON(this.providersUrl).catch(() => null)
        );

        if (!providers) return null;
        if (!this.providers) this.providers = {};

        const data = providers.data.filter(Optimade.isProviderValid);
        const ver = providers.meta && providers.meta.api_version ?
            providers.meta.api_version.charAt(0) : '';

        for (const provider of data) {
            if (!this.apis[provider.id]) this.apis[provider.id] = [];
            try {
                const api = await this.getApis(provider, ver ? `v${ver}` : '');
                if (!api) continue;

                if (api.attributes.available_endpoints.includes('structures')) {
                    this.apis[provider.id].push(api);
                    if (!this.providers[provider.id]) {
                        this.providers[provider.id] = provider;
                    }
                } else {
                    await this.getProviders(api);
                }
            } catch (ignore) { }
        }

        return this.providers;
    }

    async getApis(provider: Types.Provider | string, version: string = ''): Promise<Types.Api | null> {
        if (typeof provider === 'string') {
            provider = this.providers[provider];
        }

        if (!provider) throw new Error('No provider found');

        const url: string = this.wrapUrl(`${provider.attributes.base_url}/${version}`, '/info');

        if (this.isDuplicatedReq(url)) return null;

        const apis: Types.InfoResponse = await Optimade.getJSON(url);
        return Optimade.apiVersion(apis);
    }

    async getStructures(providerId: string, filter: string = '', page: number = 0): Promise<Types.ProviderApisResponse[] | null> {

        if (!this.apis[providerId]) return null;

        const apis = this.apis[providerId].filter(api => api.attributes.available_endpoints.includes('structures'));
        const provider = this.providers[providerId];
        const limit = Math.max(...provider.attributes.query_limits);

        const structures: Types.StructuresResponse[] = await allSettled(apis.map((api: Types.Api) => {
            const url: string = this.wrapUrl(Optimade.apiVersionUrl(api), filter ? `/structures?filter=${filter}&page_limit=${limit}&page_offset=${limit * page}&page_number=${page}` : `/structures?page_limit=${limit}`);
            return Optimade.getJSON(url, {}, { Origin: 'https://cors.optimade.science', 'X-Requested-With': 'XMLHttpRequest' }).catch(error => { return error; });
        }));

        return structures.reduce((structures: any[], structure: Types.StructuresResponse | Types.ResponseError): Types.ProviderApisResponse[] => {
            console.log(structure);

            if (structure instanceof Error) {
                return structures.concat(structure);
            } else {
                const { data, meta } = structure;
                const pages = page === 0 && Math.trunc(meta.data_returned / limit) + 1;
                const api = {
                    data,
                    meta: {
                        version: meta.api_version,
                        available: meta.data_available,
                        returned: meta.data_returned,
                        more: meta.more_data_available,
                        query: meta.query.representation,
                        limit,
                        pages
                    }
                };
                return structures.concat(api);
            }
        }, []);
    }

    getStructuresAll(providerIds: string[], filter: string = '', batch: boolean = true): Promise<Promise<Types.StructuresResult>[]> | Promise<Types.StructuresResult>[] {

        const results = providerIds.reduce((structures: Promise<any>[], providerId: string) => {
            const provider = this.providers[providerId];
            if (provider) {
                structures.push(allSettled([
                    this.getStructures(providerId, filter),
                    Promise.resolve(provider)
                ]));
            }
            return structures;
        }, []);

        return batch ? Promise.all(results) : results;
    }

    private async followLinks(api: Types.Api): Promise<Types.LinksResponse | null> {
        if (!api.attributes.available_endpoints.includes('links')) return null;

        const url = this.wrapUrl(Optimade.apiVersionUrl(api), '/links');

        return !this.isDuplicatedReq(url) ? Optimade.getJSON(url) : null;
    }

    private wrapUrl(url, tail = '') {
        url = this.corsProxyUrl ? `${this.corsProxyUrl}/${url.replace('://', '/').replace('//', '/')}` : url;
        return tail ? url.replace(/\/$/, '') + tail : url;
    }

    private isDuplicatedReq(url: string): boolean {
        return this.reqStack.includes(url) || !this.reqStack.unshift(url);
    }

    static async getJSON(uri: string, params: {} = null, headers: {} = {}) {

        const url = new URL(uri);
        const timeout = 10000;

        if (params) {
            Object.entries(params).forEach((param: [string, any]) => url.searchParams.append(...param));
        }

        const res = await fetchWithTimeout(url.toString(), { headers }, timeout);

        if (!res.ok) {
            const err: Types.ResponseError = new Error(res.statusText);
            err.response = res;
            throw err;
        }

        if (res.status !== 204) {
            return await res.json();
        }
    }

    static isProviderValid(provider: Types.Provider) {
        return provider.attributes.base_url && !provider.attributes.base_url.includes('example');
    }

    static apiVersionUrl({ attributes: { api_version, available_api_versions } }: Types.Api) {
        let url = available_api_versions[api_version];
        if (!url && Array.isArray(available_api_versions)) {
            const api = available_api_versions.find(({ version }) => version === api_version);
            url = api && api.url;
        }
        return url;
    }

    static apiVersion({ data, meta }: Types.InfoResponse): Types.Api {
        return Array.isArray(data) ?
            data.find(({ attributes }) => attributes.api_version === meta.api_version) :
            data;
    }
}