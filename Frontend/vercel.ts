import { routes, type VercelConfig } from '@vercel/config/v1';

const BACKEND_URL = process.env.API_BASE_URL;

if (!BACKEND_URL) {
  throw new Error('API_BASE_URL environment variable is required (set it in Vercel Project Settings).');
}

export const config: VercelConfig = {
  framework: 'vite',
  rewrites: [
    routes.rewrite('/api/(.*)', `${BACKEND_URL}/api/$1`),
    routes.rewrite('/(.*)', '/index.html'),
  ],
  headers: [
    routes.header('/api/(.*)', [
      { key: 'x-vercel-enable-rewrite-caching', value: '0' },
    ]),
  ],
};
