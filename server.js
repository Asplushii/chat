const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        } else if (req.url === '/style.css') {
            fs.readFile(path.join(__dirname, 'style.css'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    res.end(data);
                }
            });
        } else if (req.url === '/script.js') {
            fs.readFile(path.join(__dirname, 'script.js'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/javascript' });
                    res.end(data);
                }
            });
        }
    } else if (req.method === 'POST' && req.url === '/send') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); 
        });
        req.on('end', () => {
            const { message, nickname } = parse(body);
            const formattedMessage = `${nickname}: ${message}`;
            console.log(formattedMessage); 
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('received');
            broadcastMessage(formattedMessage); 
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
});

const clients = [];

function broadcastMessage(message) {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ message })}\n\n`);
    });
}

server.on('request', (req, res) => {
    if (req.url === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');
        const clientId = Date.now();
        const newClient = {
            id: clientId,
            res
        };
        clients.push(newClient);

        req.on('close', () => {
            console.log(`${clientId} connection closed`);
            clients.splice(clients.indexOf(newClient), 1);
        });
    }
});