import 'isomorphic-unfetch';

import { allSettled } from './utils';

import type * as Types from './types';
export { Types };

export class Optimade {
    private providersUrl: string = '';
    private corsProxyUrl: string = '';
    private providers: Types.ProvidersMap = {};
    private apis: Types.ApisMap = {};
    private reqStack: string[] = [];
    constructor({ providersUrl = '', corsProxyUrl = '' }) {
        this.corsProxyUrl = corsProxyUrl;
        this.providersUrl = this.wrapUrl(providersUrl);
    }

    async getProviders(api?: Types.Api): Promise<Types.ProvidersMap | null> {
        const providers: Types.ProvidersResponse | null = await (api ?
            this.followLinks(api).catch(() => null) :
            Optimade.getJSON(this.providersUrl).catch(() => null)
        );

        if (!providers) return null;

        const data = providers.data.filter(Optimade.isProviderValid);
        const ver = providers?.meta?.api_version?.charAt(0);

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

    async getApis(provider: Types.Provider, version: string = ''): Promise<Types.Api | null> {
        const url: string = this.wrapUrl(`${provider.attributes.base_url}/${version}`, '/info');

        if (this.isDuplicatedReq(url)) return null;

        const apis: Types.InfoResponse = await Optimade.getJSON(url);
        return Optimade.apiVersion(apis);
    }

    async getStructures(provider: Types.Provider, filter: string = ''): Promise<Types.Structure[] | null> {

        if (!this.apis[provider.id] || !filter) return null;

        const apis = this.apis[provider.id].filter(api => api.attributes.available_endpoints.includes('structures'));

        const structures: Types.StructuresResponse[] = await allSettled(apis.map((api: Types.Api) => {
            const url: string = this.wrapUrl(Optimade.apiVersionUrl(api), `/structures?filter=${filter}`);
            return Optimade.getJSON(url);
        }));

        return structures.reduce((structures: Types.Structure[], structure: Types.StructuresResponse | null) => {
            return structure ? structures.concat(structure.data) : structures;
        }, []);
    }

    async getStructuresAll(providers: Types.Provider[], filter: string = ''): Promise<[Promise<Types.Structure>, Promise<Types.Provider>][][]> {
        return Promise.all(providers.map(provider => allSettled([
            this.getStructures(provider, filter),
            Promise.resolve(provider)
        ])));
    }

    private async followLinks(api: Types.Api): Promise<Types.LinksResponse | null> {
        if (!api.attributes.available_endpoints.includes('links')) return null;

        const url = this.wrapUrl(Optimade.apiVersionUrl(api), '/links');

        return !this.isDuplicatedReq(url) ? Optimade.getJSON(url) : null;
    }

    private wrapUrl(url, tail = '') {
        url = this.corsProxyUrl ? `${this.corsProxyUrl}/${url.replace('://', '/')}` : url;
        return tail ? url.replace(/\/$/, '') + tail : url;
    }

    private isDuplicatedReq(url: string): boolean {
        return this.reqStack.includes(url) || !this.reqStack.unshift(url);
    }

    static async getJSON(uri: string, params: {} = null, headers: {} = {}) {

        const url = new URL(uri);

        if (params) {
            Object.entries(params).forEach((param: [string, any]) => url.searchParams.append(...param));
        }

        const res = await fetch(url.toString(), { headers });

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