import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';

export default [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      interop: 'auto'
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            strict: false,
            noImplicitAny: false,
            target: 'ES5',
            module: 'ESNext'
          }
        }
      }),
      terser()
    ],
    external: ['react', 'react-dom', '@tanstack/react-virtual']
  },
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            strict: false,
            noImplicitAny: false,
            target: 'ES2015',
            module: 'ESNext'
          }
        }
      }),
      terser()
    ],
    external: ['react', 'react-dom', '@tanstack/react-virtual']
  }
];