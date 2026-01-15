// rollup.config.js - Fixed to create g2gdao.bundle.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      })
    ]
  },

  // CommonJS build
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },

  // UMD build for browser - THIS CREATES g2gdao.bundle.js
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/g2gdao.bundle.js',  // <-- Make sure this matches your HTML
      format: 'umd',
      name: 'G2GDAO',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      },
      exports: 'named'  // CRITICAL: Exports all named exports
    },
    plugins: [
      resolve({
        browser: true,  // Use browser-compatible versions
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
];