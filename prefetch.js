#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Optimade } = require('./dist/index');

const { AbortController } = require('node-abort-controller');

global.AbortController = AbortController;

const optimade = new Optimade({
	providersUrl: 'https://providers.optimade.org/providers.json'
});

optimade.getProviders().then(async () => {

	const providers = optimade.providers;
	const apis = optimade.apis;

	async function getQueryLimits(providers, filter = 'oqmd.org', max = 5000) {
		const filtered = Object.entries(providers).filter(([k, v]) => !v.attributes.base_url.includes(filter));

		const fetchLimits = async (k, v) => {
			const url = `${v.attributes.base_url}/v1/structures?filter=nelements=2&page_limit=${max}`;
			try {
				const res = await fetch(url).then(res => res.json());
				const detail = (e) => {
					return e
						? e.length
							? e[0].detail
							: e.detail
						: '0';
				};
				const nums = detail(res.errors).match(/\d+/g).filter(n => +n < max).map(n => +n);
				if (!nums.includes(0)) return {
					[k]: { ...v, attributes: { ...v.attributes, ['query_limits']: nums } }
				};
			} catch (error) {
				console.log(error);
			}
		};

		providers = await filtered.reduce(async (promise, [k, v]) => {
			const provider = await fetchLimits(k, v);
			const acc = await promise;
			return { ...acc, ...provider };
		}, Promise.resolve({}));

		console.log('providers:', providers);
		return providers;
	}

	getQueryLimits(providers).then(providers => {
		const data = { providers, apis };
		fs.writeFile(path.join(__dirname, 'dist/prefetched.json'), JSON.stringify(data), (err) => {
			if (err) throw err;
			console.log('The cache file has been saved!');
		});
	});

});
