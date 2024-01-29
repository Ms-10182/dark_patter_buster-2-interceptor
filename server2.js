const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const proxy = httpProxy.createProxyServer({});
const server = http.createServer((req, res) => {
    const { url, method, headers } = req;
    const timestamp = new Date().toISOString();

    const reqLog = `${timestamp} - Request URL: ${url}, Method: ${method}, Headers: ${JSON.stringify(headers)}\n`;
    fs.appendFile(path.join(__dirname, 'req.txt'), reqLog, (err) => {
        if (err) {
            console.error('Error writing to req.txt:', err);
        }
    });

    proxy.web(req, res, { target: url, changeOrigin: true }, (e) => {
        if (e) {
            console.error('Proxy error:', e);
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Proxy error');
        }
    });

    proxy.on('proxyRes', (proxyRes, req, res) => {
        const resLog = `${timestamp} - Response from URL: ${url}, Status Code: ${proxyRes.statusCode}\n`;
        fs.appendFile(path.join(__dirname, 'res.txt'), resLog, (err) => {
            if (err) {
                console.error('Error writing to res.txt:', err);
            }
        });
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
