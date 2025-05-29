const http = require('http');
const fs = require('fs');

const port = 7900;
const serverRoot = '../web';
const sharedFolder = '../shared';

const get = require('./server-get');
get.setSharedFolder(sharedFolder);
get.setServerRoot(serverRoot);

const post = require('./server-post');
post.setSharedFolder(sharedFolder);

const del = require('./server-delete.js');
del.setSharedFolder(sharedFolder);

if (!fs.existsSync(sharedFolder)){
    fs.mkdirSync(sharedFolder);
}

function handleRequest(req,res){
    const method = req.method;
    switch (method){
        case 'GET':
            get.processGet(req,res);
        break;
        case 'DELETE':
            del.processDELETE(req,res);
        break;
        case 'POST':
            post.processPOST(req,res);
        break;
    }
}

const server = http.createServer((req,res) => {
    handleRequest(req,res);
});
server.listen(port);