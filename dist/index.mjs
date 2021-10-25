import 'isomorphic-unfetch';

function allSettled(promises, catcher = () => null) {
    return Promise.all(promises.map(promise => promise.catch(catcher)));
}
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const ac = new AbortController();
    const signal = ac.signal;
    const timer = setTimeout(() => ac.abort(), timeout);
    try {
        return await fetch(url, { ...options, signal });
    }
    catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw err;
    }
    finally {
        clearTimeout(timer);
    }
}

class Optimade {
    constructor({ providersUrl = '', corsProxyUrl = '' } = {}) {
        this.providersUrl = '';
        this.corsProxyUrl = '';
        this.providers = null;
        this.apis = {};
        this.reqStack = [];
        this.corsProxyUrl = corsProxyUrl;
        this.providersUrl = this.wrapUrl(providersUrl);
    }
    async getProviders(api) {
        const providers = await (api ?
            this.followLinks(api).catch(() => null) :
            Optimade.getJSON(this.providersUrl).catch(() => null));
        if (!providers)
            return null;
        if (!this.providers)
            this.providers = {};
        const data = providers.data.filter(Optimade.isProviderValid);
        const ver = providers.meta && providers.meta.api_version ?
            providers.meta.api_version.charAt(0) : '';
        for (const provider of data) {
            if (!this.apis[provider.id])
                this.apis[provider.id] = [];
            try {
                const api = await this.getApis(provider, ver ? `v${ver}` : '');
                if (!api)
                    continue;
                if (api.attributes.available_endpoints.includes('structures')) {
                    this.apis[provider.id].push(api);
                    if (!this.providers[provider.id]) {
                        this.providers[provider.id] = provider;
                    }
                }
                else {
                    await this.getProviders(api);
                }
            }
            catch (ignore) { }
        }
        return this.providers;
    }
    async getApis(provider, version = '') {
        if (typeof provider === 'string') {
            provider = this.providers[provider];
        }
        if (!provider)
            throw new Error('No provider found');
        const url = this.wrapUrl(`${provider.attributes.base_url}/${version}`, '/info');
        if (this.isDuplicatedReq(url))
            return null;
        const apis = await Optimade.getJSON(url);
        return Optimade.apiVersion(apis);
    }
    async getStructures(providerId, filter = '', page = 0, limit) {
        if (!this.apis[providerId])
            return null;
        const apis = this.apis[providerId].filter(api => api.attributes.available_endpoints.includes('structures'));
        const provider = this.providers[providerId];
        const structures = await allSettled(apis.map(async (api) => {
            const pageLimit = limit ? `&page_limit=${limit}` : '';
            const pageNumber = page ? `&page_number=${page}` : '';
            const pageOffset = limit && page ? `&page_offset=${limit * page}` : '';
            const params = filter ? `${pageLimit + pageNumber + pageOffset}` : `?${pageLimit}`;
            const url = this.wrapUrl(Optimade.apiVersionUrl(api), filter ? `/structures?filter=${filter + params}` : `/structures${params}`);
            try {
                return await Optimade.getJSON(url, {}, { Origin: 'https://cors.optimade.science', 'X-Requested-With': 'XMLHttpRequest' });
            }
            catch (error) {
                return error;
            }
        }));
        return structures.reduce((structures, structure) => {
            console.dir('optimade-client:', structure);
            if (structure instanceof Error || Object.keys(structure).includes('errors')) {
                return structures.concat(structure);
            }
            else {
                structure.meta.pages = Math.ceil(structure.meta.data_returned / (limit || structure.data.length));
                structure.meta.limit = Math.max(...provider.attributes.query_limits);
                return structures.concat(structure);
            }
        }, []);
    }
    getStructuresAll(providerIds, filter = '', page = 0, limit, batch = true) {
        const results = providerIds.reduce((structures, providerId) => {
            const provider = this.providers[providerId];
            if (provider) {
                structures.push(allSettled([
                    this.getStructures(providerId, filter, page, limit),
                    Promise.resolve(provider)
                ]));
            }
            return structures;
        }, []);
        return batch ? Promise.all(results) : results;
    }
    async followLinks(api) {
        if (!api.attributes.available_endpoints.includes('links'))
            return null;
        const url = this.wrapUrl(Optimade.apiVersionUrl(api), '/links');
        return !this.isDuplicatedReq(url) ? Optimade.getJSON(url) : null;
    }
    wrapUrl(url, tail = '') {
        url = this.corsProxyUrl ? `${this.corsProxyUrl}/${url.replace('://', '/').replace('//', '/')}` : url;
        return tail ? url.replace(/\/$/, '') + tail : url;
    }
    isDuplicatedReq(url) {
        return this.reqStack.includes(url) || !this.reqStack.unshift(url);
    }
    static async getJSON(uri, params = null, headers = {}) {
        const url = new URL(uri);
        const timeout = 10000;
        if (params) {
            Object.entries(params).forEach((param) => url.searchParams.append(...param));
        }
        const res = await fetchWithTimeout(url.toString(), { headers }, timeout);
        if (!res.ok) {
            const error = await res.json();
            const detail = error.errors.length ? error.errors[0].detail : error.errors.detail;
            const message = `${detail}`;
            const err = new Error(message);
            err.response = error;
            throw err;
        }
        if (res.status !== 204) {
            return await res.json();
        }
    }
    static isProviderValid(provider) {
        return provider.attributes.base_url && !provider.attributes.base_url.includes('example');
    }
    static apiVersionUrl({ attributes: { api_version, available_api_versions } }) {
        let url = available_api_versions[api_version];
        if (!url && Array.isArray(available_api_versions)) {
            const api = available_api_versions.find(({ version }) => version === api_version);
            url = api && api.url;
        }
        return url;
    }
    static apiVersion({ data, meta }) {
        return Array.isArray(data) ?
            data.find(({ attributes }) => attributes.api_version === meta.api_version) :
            data;
    }
}

export { Optimade };
