import path from 'path';

export function sanitize(url){
    const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    return safePath;
}