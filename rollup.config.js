import cjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import { babel as babelPlugin } from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript2 from 'rollup-plugin-typescript2'
import pkg from './package.json'
import path from 'path'
import rimraf from "rimraf";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

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
const isDev = process.env.NODE_ENV === 'development'
if (isDev) {
  // 本地运行之前先清除node_modules下的缓存，否则typescript二次编译时会报错
  rimraf('./node_modules/.cache', (err) => err && console.log(err))
}
const createConfig = format => {
  const input = './src/index.ts'
  const isUmd = format === 'umd'
  let output = {
    format: format,
    file: `dist/${pkg.name}.${format}.js`,
    exports: 'named',
  }
  const external = isUmd ? [] : Object.keys(pkg.dependencies)
  const plugins = [
    resolve(),
    cjs(),
    ts(),
    babel(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    filesize({ showBrotliSize: true }),
  ]
  if (isUmd) {
    output = {
      ...output,
      name: pkg.name.replace(/-(\w)/g, (_, $1) => $1.toUpperCase()),
      // 只有umd需要压缩
      plugins: [terser({ output: { comments: false } })],
    }
  }
  if (isDev) {
    plugins.push(serve({
      open: true, // 自动打开页面
      port: 8000,
      openPage: '/src/example.html', // 打开的页面
      contentBase: ''
    }), livereload())
  }
  return {
    input,
    external,
    output,
    plugins,
  }
}

export default () => (isDev ? ['umd'] : ['esm', 'cjs', 'umd']).map(createConfig)
