import { IBundleOptions } from 'father';
import commonjs from 'rollup-plugin-commonjs';

const options: IBundleOptions = {
  cjs: false,
  esm: 'rollup',
  doc: { typescript: true } as any,
  extraRollupPlugins: [
    commonjs({
      include: 'node_modules/**',
    }),
  ],
  lessInRollupMode: {},
};

export default options;
