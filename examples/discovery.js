#!/usr/bin/env node

const { Optimade } = require('./../dist/index');

const optimadeClient = new Optimade({providersUrl: 'https://providers.optimade.org/providers.json'});

optimadeClient.getProviders().then(async data => {

    let providers = Object.keys(optimadeClient.providers),
        apis = [];
    console.log('Providers found: ' + providers.length);
    providers.sort();
    console.log('Providers: ' + providers.join(', '));
    //console.dir(optimadeClient.providers, {depth: null});

    for (const api in optimadeClient.apis){
        if (optimadeClient.apis[api].length) apis.push(api);
    }
    console.log('APIs found: ' + apis.length);
    apis.sort();
    console.log('APIs: ' + apis.join(', '));
    //console.dir(optimadeClient.apis, {depth: null});

}).catch(console.error);