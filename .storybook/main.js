module.exports = {
  "stories": [
    "../packages/**/src/*.stories.mdx",
    "../packages/**/src/*.stories.@(js|jsx|ts|tsx)",
    "../**/*.stories.mdx",
    // "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-storysource/register",
    "storybook-css-modules-preset",
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack',
        options: {},
      }],
    })

    const i = config.module.rules.findIndex(a => a.test.toString().startsWith('/\\.(svg'))

    if (~i) {
      config.module.rules.splice(i, 1, {
        ...config.module.rules[i],
        test: new RegExp(config.module.rules[i].test.toString()
          .replace(/\//gi, '').replace('(svg|', '(')),
      })
    }

    return config
  },
}
