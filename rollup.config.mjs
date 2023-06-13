// Description: rollup 配置文件
import { fileURLToPath } from 'node:url' // 引入node.js的url模块
import path from 'path' // 引入path模块
import { nodeResolve } from '@rollup/plugin-node-resolve' // 解析第三方模块
import bebel from '@rollup/plugin-babel' // 将ES6+代码转换为ES5
import commonjs from '@rollup/plugin-commonjs' // 将CommonJS模块转换为ES6模块
import terser from '@rollup/plugin-terser' // 压缩代码

// 读取当前文件所在的目录
const __dirname = path.dirname(fileURLToPath(import.meta.url))
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.js', // 入口文件
  output: [
    // 输出文件
    {
      file: path.resolve(__dirname, 'dist/index.esm.js'),
      format: 'esm'
    }
  ],
  plugins: [
    nodeResolve({
      browser: true // 该属性是为了解决rollup无法识别第三方模块的问题
    }),
    terser(),
    commonjs(),
    bebel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}
export default config
