import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import { terser } from 'rollup-plugin-terser';

const production = process.env.BUILD === 'production';

function finalExport(options) {
  let moduleStr = `module.exports = ${options.moduleName};`;
  let varStr = `var ${options.moduleName} = {`;
  let varReplaceStr = `module.exports = {`;
  return {
    name: 'final-export',
    renderChunk (code, chunk, options) {
      if (code.indexOf(moduleStr) === -1) return null;
      code = code.replace(moduleStr, '');
      return code.replace(varStr, varReplaceStr);
    }
  };
}

export default {
  input: ['extension-common.js'],
  output: {
    file: 'out/extension-common.js',
    format: 'cjs',
    exports: 'default'
  },
  plugins: [
    resolve(),
    commonjs(),
    finalExport({moduleName: 'extensionCommon'}),
    // production && terser(),
  ],
  external: ['vscode']
};