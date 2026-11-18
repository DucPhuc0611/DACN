const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../database/db.cjs');

const root = path.resolve(__dirname, '..');
const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=utf-8'
};

function sendJson(res, status, payload) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 5 * 1024 * 1024) {
                reject(new Error('Payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

db.openDB();

const server = http.createServer(async (req, res) => {
    let url;
    try {
        url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        res.writeHead(400).end();
        return;
    }

    // REST API for SQLite Database synchronization & relational table inspection
    if (url === '/api/version' && req.method === 'GET') {
        sendJson(res, 200, { version: db.getVersion() });
        return;
    }
    if (url === '/api/storage' && req.method === 'GET') {
        sendJson(res, 200, db.getAllStorage());
        return;
    }
    if (url === '/api/storage' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const result = db.updateStorage(body.items || {});
            sendJson(res, 200, result);
        } catch (err) {
            sendJson(res, 400, { error: err.message });
        }
        return;
    }
    if (url === '/api/storage/reset' && req.method === 'POST') {
        sendJson(res, 200, db.resetToSeed());
        return;
    }
    if (url === '/api/db/tables' && req.method === 'GET') {
        sendJson(res, 200, db.getRelationalSummary());
        return;
    }

    if (url.endsWith('/')) url += 'index.html';
    const file = path.resolve(root, '.' + url);
    if (!file.startsWith(root + path.sep) || !/^\/(index\.html|(?:User|Admin|shared)\/)/.test(url) || !types[path.extname(file)]) {
        res.writeHead(404).end();
        return;
    }
    fs.readFile(file, (error, data) => {
        if (error) {
            res.writeHead(404).end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
        res.end(data);
    });
});

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';
server.listen(port, host, () => {
    console.log(`SSA Hotel PMS (SQLite DB): http://127.0.0.1:${server.address().port}`);
});
