#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Optimade } = require('./dist/index');

const optimade = new Optimade({
    providersUrl: 'https://providers.optimade.org/providers.json'
});

optimade.getProviders().then(() => {

    const data = {
        providers: optimade.providers,
        apis: optimade.apis,
    };

    fs.writeFile(path.join(__dirname, 'dist/prefetched.json'), JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('The cache file has been saved!');
    });

});