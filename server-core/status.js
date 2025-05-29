export function send404(res){
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
}

export function send500(res,err) {
    res.writeHead(500);
    if (err != null){
        res.end(`Server Error: ${err.code}`);
    }else{
        res.end('Internal server error');
    }
}

export function send403(res,path){
    res.writeHead(403);
    if (path != null){
        res.end(`Access to ${path} is denied`);
    }else{
        res.end('Access to this resource is denied');
    }
}