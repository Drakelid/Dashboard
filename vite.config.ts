import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
// no OS import; use env to set HMR host if needed

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'https://test.sambring.no';

  const devPort = Number(env.VITE_DEV_PORT || 3000);
  const hmr = env.VITE_DEV_HOST
    ? { host: env.VITE_DEV_HOST, port: devPort, clientPort: devPort, protocol: 'wss' as const }
    : undefined;

  const config: import('vite').UserConfig = {
    plugins: [vue(), mkcert()],
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      https: {},
      host: true, // bind to 0.0.0.0 so it's reachable on LAN
      port: devPort,
      strictPort: true,
      open: true,
      ...(hmr ? { hmr } : {}),
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          headers: {
            referer: target,
            origin: target,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              try {
                proxyReq.setHeader('referer', target);
                proxyReq.setHeader('origin', target);
              } catch {}
            });
          },
        },
        '/dashboard/api': {
          target,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          headers: {
            referer: target,
            origin: target,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              try {
                proxyReq.setHeader('referer', target);
                proxyReq.setHeader('origin', target);
              } catch {}
            });
          },
        },
        '/deliveries': {
          target,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          headers: {
            referer: target,
            origin: target,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              try {
                proxyReq.setHeader('referer', target);
                proxyReq.setHeader('origin', target);
              } catch {}
            });
          },
        },
        '/drivers': {
          target,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          headers: {
            referer: target,
            origin: target,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              try {
                proxyReq.setHeader('referer', target);
                proxyReq.setHeader('origin', target);
              } catch {}
            });
          },
        },
      },
    },
  };
  return config;
});
