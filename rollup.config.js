import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';


export default {
  entry: './index.js',
  dest: './static/js/bundle.js',
  format: 'iife',
  moduleName: "nuo",
  sourceMap: true,
  plugins: [
    resolve({ jsnext: true, browser: true }),
    commonjs({ include: './node_modules/**' }),
    eslint({ exclude: ['./src/styles/**'] }),
    babel({ exclude: ['./node_modules/**', './src/styles/**'] }),
    uglify(),
  ],
};
