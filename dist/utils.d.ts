import 'isomorphic-unfetch';
export declare function allSettled(promises: Promise<any>[], catcher?: () => any): Promise<any[]>;
export declare function fetchWithTimeout(url: any, options?: {}, timeout?: number): Promise<Response>;
