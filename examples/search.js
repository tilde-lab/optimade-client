#!/usr/bin/env node

const { Optimade } = require('./../dist/index');
const fs = require('fs');

const prefetched = JSON.parse(fs.readFileSync('./dist/prefetched.json', 'utf8'));

const optimadeClient = new Optimade();

optimadeClient.providers = prefetched.providers;
optimadeClient.apis = prefetched.apis;

optimadeClient.getStructuresAll(['mp', 'mpds'], 'chemical_formula_anonymous="A2B"').then(results => {
    console.dir(results, {depth: null});
});