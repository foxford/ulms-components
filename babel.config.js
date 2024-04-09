module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  env: {
    jest: {
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-private-methods'],
    },
  },
}
