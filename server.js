const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const RESULTS_FILE = path.join(ROOT, 'results.json');

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

function serveStatic(req, res){

    const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.normalize(path.join(ROOT, decodeURIComponent(urlPath)));

    if(!filePath.startsWith(ROOT)){
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if(err){
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(content);
    });
}

function saveResult(req, res){

    let body = '';

    req.on('data', chunk => { body += chunk; });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } catch(err){
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
    });
}

const server = http.createServer((req, res) => {

    if(req.method === 'POST' && req.url === '/api/result'){
        saveResult(req, res);
        return;
    }

    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`PoolPicker draait op http://localhost:${PORT}`);
});
