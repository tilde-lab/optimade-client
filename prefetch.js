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

let time = performance.now(),
	alltime = performance.now(),
	filter = process.env.filter;
//  || 'oqmd, jarvis';

optimade.getProviders().then(async (providers) => {

	console.warn('providers fetched from source', performance.now() - time);
	time = performance.now();

	const filteredApis = Object.entries(optimade.apis).filter(([k, v]) => v.length);
	const apis = filteredApis.sort().reduce((acc, [k, v]) => {
		return { ...acc, ...{ [k]: v } };
	}, {});

	const source = Object.keys(providers).sort().reduce(
		(obj, key) => {
			obj[key] = providers[key];
			return obj;
		}, {});

	console.warn('providers sorted', performance.now() - time);

	async function getQueryLimits(providers, filter = '', max = 1000) {

		providers = Object.fromEntries(Object.entries(providers).filter(([key]) => !filter.includes(key)));

		const fetchLimits = async (k, v) => {
			const formula = `chemical_formula_anonymous="A2B"`;
			const url = `${v.attributes.base_url}/v1/structures?filter=${formula}&page_limit=${max}`;
			try {
				const res = await fetch(url).then(res => res.json());
				const api = res.meta && res.meta.api_version || apis[k][0].attributes.api_version;
				//console.dir(res);
				const detail = (e) => {
					return e
						? e.length
							? e[0].detail
							: e.detail
						: '0';
				};
				const nums = detail(res.errors).match(/\d+/g).filter(n => +n < max).map(n => +n);
				return {
					[k]: { ...v, attributes: { ...v.attributes, api_version: api, ['query_limits']: !nums.includes(0) ? nums : [10] } }
				};
			} catch (error) {
				console.log(error);
			}
		};
		time = performance.now();
		return await Object.entries(providers).reduce(async (promise, [k, v], i) => {
			const provider = await fetchLimits(k, v);
			const acc = await promise;
			console.log(i, provider);
			return { ...acc, ...provider };
		}, Promise.resolve({}));
	}

	getQueryLimits(source, filter).then(providers => {
		const data = { providers, apis };

		console.warn('limits fetched', performance.now() - time);

		console.log({
			prefetched: Object.keys(providers).length,
			source: Object.keys(source).length,
			alltime: performance.now() - alltime
		});

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
