import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'build/index.js',
    output: {
      file: 'index.js',
      format: 'cjs'
    },
    plugins: [
      nodeResolve(),
      commonjs({
      })
    ]
  };