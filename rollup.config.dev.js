import path from 'path'
import rimraf from 'rimraf'
import cjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import { babel as babelPlugin } from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript2 from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload';
import pkg from './package.json'

const resolve = () => nodeResolve({ extensions: ['.js', '.ts'] })
const ts = () =>
  typescript2({
    tsconfig: path.resolve(__dirname, './tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: { declaration: true, rootDir: 'src' },
    },
    useTsconfigDeclarationDir: true,
  })
const babel = () => {
  const plugins =  [
    'babel-plugin-typescript-iife-enum',
    ['@babel/plugin-transform-typescript', { isTSX: 'preserve' }],
    'babel-plugin-pure-calls-annotation',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        regenerator: false,
        useESModules: true,
      },
    ],
  ]

  babelPlugin({
    plugins,
    babelrc: false,
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    extensions: ['.js', '.ts'],
  })
}

rimraf('./node_modules/.cache', (err) => err && console.log(err))
const createConfig = format => {
  const input = './src/index.ts'
  const isUmd = format === 'umd'
  let output = {
    format: format,
    file: `dist/${pkg.name}.${format}.js`,
    exports: 'named',
  }
  const external = isUmd ? [] : ['@vue/reactivity', 'lit-html']
  const plugins = [
    resolve(),
    cjs(),
    ts(),
    babel(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    serve({
      open: true, // 自动打开页面
      port: 8000,
      openPage: '/src/example.html', // 打开的页面
      contentBase: ''
    }),
    livereload(),
  ]
  if (isUmd) {
    output = {
      ...output,
      name: pkg.name.replace(/-(\w)/g, (_, $1) => $1.toUpperCase()),
      // 只有umd需要压缩
      plugins: [terser()],
    }
  }
  return {
    input,
    external,
    output,
    plugins,
  }
}

export default () => createConfig('umd')
