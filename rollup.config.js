import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/asciify.js',
  moduleName: 'Asciify',
  plugins: [
    buble()
  ],
  targets: [
    { dest: 'dist/asciify.cjs.js', format: 'cjs' },
    { dest: 'dist/asciify.es6.js', format: 'es6' },
    { dest: 'dist/asciify.js', format: 'iife' }
  ]
};
