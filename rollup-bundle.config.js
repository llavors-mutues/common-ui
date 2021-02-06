import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');

export default {
  input: `src/bundle.ts`,
  output: [{ dir: './bundle', format: 'es', sourcemap: true }],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash-es')
  external: [],
  plugins: [
    replace({
      'customElements.define': '',
      'process.env.NODE_ENV': '"production"',
      'window.customElements.define': '',
      delimiters: ['', ''],
    }),
    typescript({
      outDir: 'bundle',
    }),
    resolve({
      browser: true,
    }),
    commonjs({
      include: [/node_modules/],
    }),
    terser(),
  ],
};
