
import 'isomorphic-unfetch';

export function allSettled(promises: Promise<any>[], catcher = () => null) {
    return Promise.all(promises.map(promise => promise.catch(catcher)));
}

export async function fetchWithTimeout(url, options = {}, timeout = 5000): Promise<Response> {

    const ac = new AbortController();
    const signal = ac.signal;

    const timer = setTimeout(() => ac.abort(), timeout);

    try {
        return await fetch(url, { ...options, signal });
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}