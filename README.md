# Enhanced Optimade client

[![NPM version](https://img.shields.io/npm/v/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade) [![NPM downloads](https://img.shields.io/npm/dm/optimade.svg?style=flat)](https://www.npmjs.com/package/optimade)

## Features

## Install

```bash
npm i optimade --save
```

```bash
yarn add optimade
```

CDN: [UNPKG](https://unpkg.com/optimade/) | [jsDelivr](https://cdn.jsdelivr.net/npm/optimade/) (available as `window.Optimade`)

If you are **not** using using es6 or CDN, instead of this add

```html
<script src="/path/to/optimade/dist/index.js"></script>
<!-- OR -->
<script type="module" src="/path/to/optimade/dist/index.mjs"></script>
```

just before closing body tag.

## Usage

```javascript
import { Optimade } from 'optimade';

const optimadeClient = new Optimade({
    providersUrl: '/path/to/optimade/providers.json'
});

const providersMap = await optimadeClient.getProviders();

const providerArray = Object.values(providersMap);

const results = await optimadeClient.getStructuresAll(providerArray, filter);
```

## License

MIT &copy; [PaulMaly](https://github.com/PaulMaly)
