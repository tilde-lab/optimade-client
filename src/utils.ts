export function allSettled(promises: Promise<any>[], catcher = () => null) {
    return Promise.all(promises.map(promise => promise.catch(catcher)));
}