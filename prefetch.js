#!/usr/bin/env node

/* jshint esversion: 6 */

const fs = require('fs');
const path = require('path');
const { Optimade } = require('./dist/index');

const { AbortController } = require('node-abort-controller');

global.AbortController = AbortController;

const optimade = new Optimade({
	providersUrl: 'https://providers.optimade.org/providers.json'
});

optimade.getProviders().then(async () => {

	const filteredApis = Object.entries(optimade.apis).filter(([k, v]) => v.length);
	const apis = filteredApis.sort().reduce((acc, [k, v]) => {
		return { ...acc, ...{ [k]: v } };
	}, {});

	const source = Object.keys(optimade.providers).sort().reduce(
		(obj, key) => {
			obj[key] = optimade.providers[key];
			return obj;
		}, {});

	async function getQueryLimits(providers, max = 1000) {

		const fetchLimits = async (k, v) => {
			const url = `${v.attributes.base_url}/v1/structures?filter=chemical_formula_anonymous="A2B"&page_limit=${max}`;
			try {
				const res = await fetch(url).then(res => res.json());
				const api = res.meta && res.meta.api_version;
				console.dir(res);
				const detail = (e) => {
					return e
						? e.length
							? e[0].detail
							: e.detail
						: '0';
				};
				const nums = detail(res.errors).match(/\d+/g).filter(n => +n < max).map(n => +n);
				if (!nums.includes(0))
					return {
						[k]: { ...v, attributes: { ...v.attributes, api_version: api, ['query_limits']: nums } }
					};
			} catch (error) {
				console.log(error);
			}
		};

		providers = await Object.entries(providers).reduce(async (promise, [k, v]) => {
			const provider = await fetchLimits(k, v);
			const acc = await promise;
			return { ...acc, ...provider };
		}, Promise.resolve({}));

		const log = { prefetched: Object.keys(providers).length, source: Object.keys(source).length };
		console.log(log);

		return providers;
	}

	getQueryLimits(source).then(providers => {
		const data = { providers, apis };
		fs.writeFile(path.join(__dirname, 'dist/prefetched.json'), JSON.stringify(data), (err) => {
			if (err) throw err;
			console.log('The prefetched.json file has been saved!');
		});
		fs.writeFile(path.join(__dirname, 'dist/providers.json'), JSON.stringify(source), (err) => {
			if (err) throw err;
			console.log('The providers.json file has been saved!');
		});
	});

});
