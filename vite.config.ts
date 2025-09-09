import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve'
  
  return {
    plugins: [
      react(),
      !isServe && dts({
        insertTypesEntry: true,
      })
    ].filter(Boolean),
    
    // Для dev режима
    root: isServe ? resolve(__dirname, 'example') : undefined,
    
    // Конфигурация для dev сервера
    server: isServe ? {
      port: 3000,
      host: '0.0.0.0'
    } : undefined,
    
    // Алиасы для dev режима
    resolve: isServe ? {
      alias: {
        'react-infinite-scroll-calendar': resolve(__dirname, 'src/index.ts')
      }
    } : undefined,
    
    // Для build режима
    build: isServe ? undefined : {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ReactInfiniteScrollCalendar',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', '@tanstack/react-virtual'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            '@tanstack/react-virtual': 'ReactVirtual'
          }
        }
      },
      sourcemap: true,
      outDir: resolve(__dirname, 'dist'),
      minify: 'terser',
      target: 'es2015'
    }
  }
})