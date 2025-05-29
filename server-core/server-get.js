import path from 'path';
import fs from 'fs';

import { sanitize } from './sanitization.js';
import { send404, send500 } from './status.js'

let sharedFolder;
export function setSharedFolder(path){
    sharedFolder = path;
}

let serverRoot;
export function setServerRoot(path){
    serverRoot = path;
}

export function processGet(req,res){
    let url;
    switch(req.url){
        case '/':
            url = '/index.html'
        break;
        case '/shared':
            url = '/shared';
        break;
        default:
            url = req.url;
        break;
    }
    const safePath = sanitize(url);
    let filePath;
    if (url == '/shared'){
        filePath = sharedFolder;
        fetchFolder(res, filePath);
    }else if(url.includes('/shared/')) {
        url = `..${url}`;
        filePath = url;
        serveFile(res, filePath);
    }else{
        filePath = path.join(serverRoot, safePath);
        serveFile(res, filePath);
    }
}

function serveFile(res, filePath){
    fs.stat(filePath, (err,stats) => {
        if (err) {
            send404();
            return;
        }else{
            const stream = fs.createReadStream(filePath);
                stream.on('error', (err) => {
                    send500(res,err);
                });

            let ext = path.extname(filePath);
            const contentType = getContentType(ext);
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Content-Length' : stats.size
            });
            stream.pipe(res);
        }
    });
}

function fetchFolder(res, path){
    const data = fs.readdirSync(path);
    let dataNew = new Array();
    data.forEach(element => {
        const i = element.split(".");
        if (i.length > 1){
            dataNew.push(element);
        }
    });

    const out = JSON.stringify(dataNew);
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.end(out);
}

function getContentType(ext){
    const types = {
        '.html' :   'text/html',
        '.css'  :   'text/css',
        '.js'   :   'text/javascript',
        '.ico'  :   'image/x-icon',
        '.png'  :   'image/png',
    }
    return types[ext] || 'text/plain';
}
