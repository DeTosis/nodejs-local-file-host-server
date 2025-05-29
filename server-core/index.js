const http = require('http');
const fs = require('fs');
const path = require('path');
const { compileFunction } = require('vm');

const port = 7900;
const serverRoot = '../web'
const sharedFolder = '../shared'

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

function send404(res){
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
}

function send500(res,err) {
    res.writeHead(500);
    if (err != null){
        res.end(`Server Error: ${err.code}`);
    }else{
        res.end('Internal server error');
    }
}

function send403(res,path){
    res.writeHead(403);
    if (path != null){
        res.end(`Access to ${path} is denied`);
    }else{
        res.end('Access to this resource is denied');
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

function handleRequest(req,res){
    const method = req.method;
    switch (method){
        case 'GET':
            processGet(req,res);
        break;
        case 'DELETE':
            processDELETE(req,res);
        break;
        case 'POST':
            processPOST(req,res);
        break;
    }
}

function processGet(req,res){
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

function processDELETE(req,res){
    const decoded = decodeURIComponent(req.url);
    const safePath = sanitize(decoded);

    const parts = safePath.split('\\');
    const fileName = parts[parts.length - 1];
    
    const sharedFiles = fs.readdirSync(sharedFolder);
    if (sharedFiles.includes(fileName)){
        try{
            fs.unlinkSync(`${sharedFolder}/${fileName}`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("File deleted successfully");
        }catch (err){
            send500(res,err);
        }
    }else{
        send403(res, safePath);
    }
}

function processPOST(req,res){
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')){
        const boundary = contentType.split('boundary=')[1];

        parseMultipartData(req, boundary, () => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("File uploaded");
        });
    };
}

function parseMultipartData(req, boundary, callback) {
    let data = '';

    req.setEncoding('utf8'); // Use utf8, not binary

    req.on('data', chunk => {
        data += chunk;
    });

    req.on('end', () => {
        const parts = data.split(boundary).filter(part => part.trim());

        for (let part of parts) {
            const headerEndIndex = part.indexOf('\r\n\r\n');
            if (headerEndIndex === -1) continue;

            const headers = part.slice(0, headerEndIndex);
            const content = part.slice(headerEndIndex + 4, part.lastIndexOf('\r\n'));

            const match = headers.match(/filename="(.+?)"/);
            if (match) {
                let filename = match[1];
                filename = path.basename(filename); // Sanitize

                const savePath = path.join(sharedFolder, filename);
                fs.writeFileSync(savePath, content, 'utf8'); // 'utf8' for text files, but unsafe for binary files
            }
        }

        callback();
    });
}

function sanitize(url){
    const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    return safePath;
}

const server = http.createServer((req,res) => {
    handleRequest(req,res);
});
server.listen(port);