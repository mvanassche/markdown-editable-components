import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'out-tsc/index.js',
  output: {
    file: 'build/index.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve(),
    commonjs({})
  ]
};