import fs from 'fs';

import { sanitize } from './sanitization.js';
import { send500 } from './status.js'

let sharedFolder;
export function setSharedFolder(path){
    sharedFolder = path;
}

export function processDELETE(req,res){
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