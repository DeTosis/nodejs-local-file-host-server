import path from 'path';
import fs from 'fs';

let sharedFolder;
export function setSharedFolder(path){
    sharedFolder = path;
}


export function processPOST(req,res){
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')){
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
        if (!boundaryMatch) {
            res.writeHead(400);
            return res.end('No boundary found in content-type.');
        }
        const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]);

        parseMultipartData(req, boundary, () => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("File uploaded");
        });
    };
}

function parseMultipartData(req, boundary, callback) {
    let data = Buffer.alloc(0);

    req.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
    });

    req.on('end', () => {
        const parts = data.toString('latin1').split(boundary).filter(p => p.trim());

        for (const part of parts) {
            const [rawHeaders, rawBody] = part.split('\r\n\r\n');
            if (!rawHeaders || !rawBody) continue;

            const headers = rawHeaders.split('\r\n');
            const disposition = headers.find(h => h.toLowerCase().startsWith('content-disposition'));
            if (!disposition) continue;

            const filenameMatch = disposition.match(/filename="(.+?)"/);
            if (!filenameMatch) continue;

            let filename = filenameMatch[1];
            filename = path.basename(filename);

            try {
                const safe = filename.replace(/%(?![0-9A-Fa-f]{2})/g, '');
                filename = decodeURIComponent(escape(safe));
            } catch (e) { }

            const bodyEnd = rawBody.lastIndexOf('\r\n');
            const fileContent = Buffer.from(rawBody.slice(0, bodyEnd), 'latin1');

            const savePath = path.join(sharedFolder, filename);
            fs.writeFileSync(savePath, fileContent);
        }
    });
    callback();
}

