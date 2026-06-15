import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import * as http from 'node:http';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Proxy all /api/* requests to the Spring Boot backend on port 8080.
 * This intercepts before Angular's catch-all handler so API calls
 * are forwarded rather than rendered as Angular routes (which would 302).
 */
app.use('/api', (req: express.Request, res: express.Response) => {
  const backendPath = '/api' + (req.url || '/');
  const options: http.RequestOptions = {
    hostname: 'localhost',
    port: 8080,
    path: backendPath,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:8080' },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(
      proxyRes.statusCode ?? 502,
      proxyRes.headers as http.OutgoingHttpHeaders,
    );
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.status(502).json({ success: false, message: 'Backend unavailable' });
    }
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
