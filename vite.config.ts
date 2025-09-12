import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'https://test.sambring.no';

  return {
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
      https: true,
      port: 3000,
      open: true,
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
});
