import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import replace from 'rollup-plugin-replace'
import serve from 'rollup-plugin-serve'

export default {
  entry: 'src/main.js',
  format: 'cjs',
  plugins: [ vue(), serve('dist'), replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.VUE_ENV': JSON.stringify('browser')
    }),
    resolve(), babel() ],
  dest: 'dist/bundle.js' // 输出文件
};