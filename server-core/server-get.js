import path, { parse } from 'path';
import fs from 'fs';

import { sanitize } from './sanitization.js';
import { send404, send500 } from './status.js'

import urlimport from 'url';

import EventEmitter from 'events';
const emitter = new EventEmitter();

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
        case '/events':
            handleEventRouting(req,res);
        return;
        default:
            url = req.url;
        break;
    }

    const parsedUrl = urlimport.parse(req.url, true);
    if (parsedUrl.pathname === '/view-image') {
        const imgSrc = parsedUrl.query.src;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${decodeURIComponent(imgSrc).split('/').reverse()[0]}</title>
                <style>
                body {
                    margin: 0;
                    background: #17171C;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                img {
                    max-width: 100%;
                    max-height: 100%;
                }
                </style>
            </head>
            <body>
                <img src="${imgSrc ? decodeURIComponent(imgSrc) : ''}" alt="Image" />
            </body>
            </html>
            `);
            return;
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

let hostedFiles = fs.readdirSync('../shared');
setInterval(() => {
    const fileUpdate = fs.readdirSync('../shared');
    if (JSON.stringify(hostedFiles) !== JSON.stringify(fileUpdate)){
        const data = { message: 'update' };
        emitter.emit('data-updated-event', data);
        hostedFiles = fileUpdate;
    }
}, 500);

function handleEventRouting(req, res){
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('\n');
    
    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const listener = (data) => sendEvent(data);
    emitter.on('data-updated-event', listener);

    req.on('close', () => {
      emitter.removeListener('data-updated-event', listener);
    });
}

function serveFile(res, filePath){
    fs.stat(filePath, (err,stats) => {
        if (err) {
            send404(res,err);
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
