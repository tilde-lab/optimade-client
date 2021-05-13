
import 'isomorphic-unfetch';

export function allSettled(promises: Promise<any>[], catcher = () => null) {
    return Promise.all(promises.map(promise => promise.catch(catcher)));
}

export function fetchWithTimeout( url, args, timeout ): any {
    return new Promise( (resolve, reject) => {

        const timer = setTimeout(
            () => reject( new Error('Request timed out') ),
            timeout
        );

        fetch( url, args ).then(
            response => resolve( response ),
            err => reject( err )
        ).finally( () => clearTimeout(timer) );

    })
}