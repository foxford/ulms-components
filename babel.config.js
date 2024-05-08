// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: 87,
          edge: 91,
          firefox: 84,
          ios: 11,
          opera: 87,
          safari: 11,
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-runtime',
    'babel-plugin-annotate-pure-calls',
    'babel-plugin-styled-components',
  ],
}
