const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.webp': 'image/webp',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=UTF-8',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    let safePath = path.normalize(req.url.split('?')[0]).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(__dirname, safePath === '\\' || safePath === '/' ? 'index.html' : safePath);

    let ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
            res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error');
            return;
        }

        // Support HTTP Range requests for video streaming
        let range = req.headers.range;
        if (range && ext === '.mp4') {
            let total = stats.size;
            let parts = range.replace(/bytes=/, "").split("-");
            let partialstart = parts[0];
            let partialend = parts[1];

            let start = parseInt(partialstart, 10);
            let end = partialend ? parseInt(partialend, 10) : total - 1;
            let chunksize = (end - start) + 1;

            let file = fs.createReadStream(filePath, { start: start, end: end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType
            });
            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': stats.size,
                'Content-Type': contentType
            });
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================================`);
    console.log(`  Vitae Local Web Server Running!`);
    console.log(`========================================================\n`);
    console.log(`  PC Local:  http://127.0.0.1:${PORT}/`);
    console.log(`\n  Keep this terminal window open while testing.`);
    console.log(`  Press Ctrl + C to stop the server.\n`);
});
