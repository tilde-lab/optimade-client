# Aggregating Optimade client for the online materials databases

[![NPM version](https://img.shields.io/npm/v/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade)
[![NPM downloads](https://img.shields.io/npm/dm/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade)
[![GitHub issues](https://img.shields.io/github/issues/tilde-lab/optimade-client?style=flat)](https://github.com/tilde-lab/optimade-client/issues)
[![DOI](https://zenodo.org/badge/317343954.svg)](https://doi.org/10.5281/zenodo.7693400)

## Features

- discovers all the [official Optimade databases](https://providers.optimade.org) recursively
- caches the discovered list (`prefetched.json`) for future and boosts the retrieval performance
- queries them all, in the browser, at the server, everywhere
- provides pagination, with the minimized number of pages

## Install

```sh
npm i optimade --save
```

```sh
yarn add optimade
```

CDN: [UNPKG](https://unpkg.com/optimade/) |
[jsDelivr](https://cdn.jsdelivr.net/npm/optimade/) (available as
`window.optimade`)

If you are **not** using ES6 or CDN, add to your HTML just before closing the
`body` tag:

```html
<script src="/path/to/optimade/dist/index.js"></script>
<!-- OR -->
<script type="module" src="/path/to/optimade/dist/index.mjs"></script>
```

## Usage

The code is generally isomorphic, however one should additionally take care of
downloading the cache or setting the CORS policy for the browsers. Concerning
the CORS, the `Optimade` class constructor accepts the `corsProxyUrl` parameter,
pointing to a running `cors-anywhere` proxy instance. This will be valid
until all the Optimade providers are supplying the header
`Access-Control-Allow-Origin $http_origin` in their responses. For the
server-side environment this is not required.

### Discovery and querying

```ts
const optimadeClient = new Optimade({
  providersUrl: "https://providers.optimade.org/providers.json",
});

console.log(optimadeClient.providers); // { [id: string]: Provider }[]

const providersMap = await optimadeClient.getProviders(); // { [id: string]: Provider }[]

const providerIds = Object.keys(providersMap); // string[]

const results = await optimadeClient.getStructuresAll({
  providers: Provider[],
  filter: YOUR_OPTIMADE_QUERY,
}); // [StructuresResponse[], Provider][]
```

Importing depends on your environment. See also the `examples` folder. The
`.html` examples are suited for the browser environment, the `.js` examples are
suited for the server environment.

### Pagination

```ts
import prefetched from 'optimade/dist/prefetched.json';

const optimadeClient = new Optimade({
  providersUrl: "https://providers.optimade.org/providers.json",
});

optimadeClient.providers = prefetched.providers;
optimadeClient.apis = prefetched.apis;

const results = await optimadeClient.getStructuresAll({
  providers: Provider[],
  filter: YOUR_OPTIMADE_QUERY,
  page: number,
  limit: number,
  offset: number,
  batch: true
}); // [StructuresResponse[], Provider][]
```

See also the `demo` folder.

## License

MIT &copy; [Pavel Malyshev](https://github.com/PaulMaly) and [Alexander Volkov](https://github.com/valexr), Tilde Materials Informatics
