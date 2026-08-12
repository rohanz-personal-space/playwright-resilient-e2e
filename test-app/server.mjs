import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const host = '127.0.0.1';
const port = Number(process.env.RESILIENCE_PORT ?? 4173);
const indexFile = new URL('./index.html', import.meta.url);

const inventory = [
  { id: 1, name: 'Resilient Backpack' },
  { id: 2, name: 'Observable Bike Light' },
];
const testOrders = new Map();

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);

  if (url.pathname === '/api/inventory') {
    sendJson(response, 200, inventory);
    return;
  }

  if (url.pathname === '/api/test-orders' && request.method === 'POST') {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const order = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    testOrders.set(order.id, order);
    sendJson(response, 201, order);
    return;
  }

  const orderMatch = url.pathname.match(/^\/api\/test-orders\/([^/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (request.method === 'GET' && testOrders.has(orderId)) {
      sendJson(response, 200, testOrders.get(orderId));
      return;
    }
    if (request.method === 'DELETE' && testOrders.delete(orderId)) {
      response.writeHead(204);
      response.end();
      return;
    }
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(await readFile(indexFile, 'utf8'));
    return;
  }

  sendJson(response, 404, { message: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`Resilience lab listening on http://${host}:${port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
