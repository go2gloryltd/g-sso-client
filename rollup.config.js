// rollup.config.js - Multi-format build configuration
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // 1. ES Module build (for modern bundlers)
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

  // 2. CommonJS build (for Node.js)
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
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 3. UMD build (for browser <script> tags) ← FIXED
  {
    input: 'src/umd.ts', // ← Use dedicated UMD entry point
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/gsso.umd.js',
      format: 'umd',
      name: 'GSSO', // This creates window.GSSO
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      },
      exports: 'default' // ← Export the default object
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 4. React wrapper - ESM
  {
    input: 'src/react.tsx',
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/react.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 5. React wrapper - CJS
  {
    input: 'src/react.tsx',
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/react.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 6. Vue wrapper - ESM
  {
    input: 'src/vue.ts',
    external: ['vue'],
    output: {
      file: 'dist/vue.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 7. Vue wrapper - CJS
  {
    input: 'src/vue.ts',
    external: ['vue'],
    output: {
      file: 'dist/vue.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
];