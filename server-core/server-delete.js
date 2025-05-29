import fs from 'fs';

import { sanitize } from './sanitization.js';
import { send500, send403 } from './status.js'
import { escape } from 'querystring';

let sharedFolder;
export function setSharedFolder(path){
    sharedFolder = path;
}

export function processDELETE(req,res){
    req.setEncoding('utf8');

    const safe = req.url.replace(/%(?![0-9A-Fa-f]{2})/g, '');
    const decoded = decodeURIComponent(safe);
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