import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import originTypescript from 'typescript';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { terser } from 'rollup-plugin-terser';
import * as pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      name: '@carrotwu/check-vue-conflict-webpack-plugin',
      exports: 'auto',
    },
  ],
  plugins: [
    replace({
      VERSION: pkg.version,
      delimiters: ['{{', '}}'],
    }),
    resolve({
      jsnext: true,
      main: true,
    }),
    typescript({
      exclude: 'node_modules/**',
      typescript: originTypescript,
    }),
    commonjs({ extensions: ['.js', '.ts'] }),
    babel({
      extensions: [...DEFAULT_EXTENSIONS, 'ts', 'tsx', 'js'],
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      babelrc: false,
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]],
    }),
    terser(),
    json(),
  ],
  external: ['@babel/parser', '@babel/traverse', '@babel/types', 'url'],
};
