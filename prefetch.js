const fs = require('fs');
const { Optimade } = require('./dist/index');

const optimade = new Optimade({
    providersUrl: 'https://providers.optimade.org/providers.json'
});

optimade.getProviders().then(() => {

    const data = {
        providers: optimade.providers,
        apis: optimade.apis,
    };
    fs.writeFile('./dist/prefetched.json', JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
})