import path from 'path';
import fs from 'fs';

let sharedFolder;
export function setSharedFolder(path){
    sharedFolder = path;
}


export function processPOST(req,res){
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

