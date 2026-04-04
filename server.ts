import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import next from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  const nakamaHost = process.env.NEXT_PUBLIC_NAKAMA_HOST || "127.0.0.1";
  const nakamaPort = process.env.NEXT_PUBLIC_NAKAMA_PORT || "7350";
  const useSSL = process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === "true";
  const protocol = useSSL ? "https" : "http";
  const wsProtocol = useSSL ? "wss" : "ws";
  const nakamaUrl = `${protocol}://${nakamaHost}:${nakamaPort}`;

  // Proxy Nakama API and WebSockets
  const nakamaProxy = createProxyMiddleware({
    pathFilter: ['/v2', '/ws'],
    target: nakamaUrl,
    changeOrigin: true,
    ws: true,
  });
  
  server.use(nakamaProxy);

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const upgradeHandler = app.getUpgradeHandler();
  httpServer.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/ws')) {
      nakamaProxy.upgrade(req, socket as any, head);
    } else {
      upgradeHandler(req, socket, head);
    }
  });

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});
