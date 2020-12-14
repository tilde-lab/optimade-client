# Aggregating Optimade client for the online materials databases

[![NPM version](https://img.shields.io/npm/v/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade) [![NPM downloads](https://img.shields.io/npm/dm/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade)

## Features

- discover all the [official Optimade databases](https://providers.optimade.org) recursively
- cache the discovered list for future and boost the retrieval performance
- query them all, in the browser, at the server, everywhere

## Install

```bash
npm i optimade --save
```

```bash
yarn add optimade
```

CDN: [UNPKG](https://unpkg.com/optimade/) | [jsDelivr](https://cdn.jsdelivr.net/npm/optimade/) (available as `window.Optimade`)

If you are **not** using es6 or CDN, add to your HTML just before closing the `body` tag:

```html
<script src="/path/to/optimade/dist/index.js"></script>
<!-- OR -->
<script type="module" src="/path/to/optimade/dist/index.mjs"></script>
```

## Usage

```javascript
import { Optimade } from 'optimade';

const optimadeClient = new Optimade({
    providersUrl: '/path/to/optimade/providers.json'
});

console.log(optimadeClient.providers); // { [id: string]: Provider }[]

const providersMap = await optimadeClient.getProviders(); // { [id: string]: Provider }[]

const providerIds = Object.keys(providersMap); // string[]

const results = await optimadeClient.getStructuresAll(providerIds, YOUR_OPTIMADE_QUERY); // [Structures[], Provider][]
```

Note the `Optimade` class constructor accepts also the `corsProxyUrl` parameter making sense for the [browser environment](https://github.com/tilde-lab/optimade.science/blob/master/src/services/optimade.ts). This will be valid until all the Optimade providers are supplying the header `Access-Control-Allow-Origin $http_origin` in their responses. For the server-side environment this is not required.

## License

MIT &copy; [PaulMaly](https://github.com/PaulMaly), Tilde Materials Informatics
