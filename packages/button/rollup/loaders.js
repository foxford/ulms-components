/* eslint-disable */
const path = require('path')
const reserved = require('reserved-words')
const postcss = require('postcss')
const findPostcssConfig = require('postcss-load-config');

const styleInjectPath = require.resolve('style-inject/dist/style-inject.es').replace(/[\\/]+/g, '/');

function loadConfig(id, {
  ctx: configOptions,
  path: configPath
}) {
  const handleError = err => {
    if (err.message.indexOf('No PostCSS Config found') === -1) {
      throw err;
    } // Return empty options for PostCSS


    return {};
  };

  configPath = configPath ? path.resolve(configPath) : path.dirname(id);
  const ctx = {
    file: {
      extname: path.extname(id),
      dirname: path.dirname(id),
      basename: path.basename(id)
    },
    options: configOptions || {}
  };
  return findPostcssConfig(ctx, configPath, {
    argv: false
  }).catch(handleError);
}

function ensurePostCSSOption(option) {
  return typeof option === 'string' ? importCwd(option) : option;
}

function isModuleFile(file) {
  return /\.module\.[a-z]{2,6}$/.test(file);
}

function escapeClassNameDashes(str) {
  return str.replace(/-+/g, match => `$${match.replace(/-/g, '_')}$`);
}

function ensureClassName(name) {
  name = escapeClassNameDashes(name);

  if (reserved.check(name)) {
    name = `$${name}$`;
  }

  return name;
}

var postcssLoader = {
  name: 'postcss',
  alwaysProcess: true,

  // `test` option is dynamically set in ./loaders
  process({
    code,
    map
  }) {
    return new Promise(function ($return, $error) {
      var config, options, plugins, shouldExtract, shouldInject, modulesExported, autoModules, supportModules, postcssOpts, res, outputMap, json, getClassName, newName;
      let output, extracted;
      return Promise.resolve(new Promise(function ($return, $error) {
        if (this.options.config) {
          return Promise.resolve(loadConfig(this.id, this.options.config)).then($return, $error);
        }

        return $return({});
      }.bind(this))).then(function ($await_4) {
        try {
          config = $await_4;
          options = this.options;
          plugins = [...(options.postcss.plugins || []), ...(config.plugins || [])];
          shouldExtract = options.extract;
          shouldInject = options.inject;
          modulesExported = {};
          autoModules = options.autoModules !== false && isModuleFile(this.id);
          supportModules = options.modules || autoModules;

          if (supportModules) {
            plugins.push(require('postcss-modules')(Object.assign({
              // In tests
              // Skip hash in names since css content on windows and linux would differ because of `new line` (\r?\n)
              generateScopedName: process.env.ROLLUP_POSTCSS_TEST ? '[name]_[local]' : '[name]_[local]__[hash:base64:5]'
            }, options.modules, {
              getJSON(filepath, json) {
                modulesExported[filepath] = json;
              }

            })));
          }

          if (options.minimize) {
            plugins.push(require('cssnano')(options.minimize));
          }

          postcssOpts = Object.assign({}, this.options.postcss, config.options, {
            // Followings are never modified by user config config
            from: this.id,
            to: this.id,
            map: this.sourceMap ? shouldExtract ? {
              inline: false,
              annotation: false
            } : {
              inline: true,
              annotation: false
            } : false
          });
          delete postcssOpts.plugins;
          postcssOpts.parser = ensurePostCSSOption(postcssOpts.parser);
          postcssOpts.syntax = ensurePostCSSOption(postcssOpts.syntax);
          postcssOpts.stringifier = ensurePostCSSOption(postcssOpts.stringifier);

          if (map && postcssOpts.map) {
            postcssOpts.map.prev = typeof map === 'string' ? JSON.parse(map) : map;
          }

          return Promise.resolve(postcss(plugins).process(code, postcssOpts)).then(function ($await_5) {
            try {
              res = $await_5;
              outputMap = res.map && JSON.parse(res.map.toString());

              if (outputMap && outputMap.sources) {
                outputMap.sources = outputMap.sources.map(v => normalizePath(v));
              }

              output = '';

              if (options.namedExports) {
                json = modulesExported[this.id];
                getClassName = typeof options.namedExports === 'function' ? options.namedExports : ensureClassName;

                // eslint-disable-next-line guard-for-in
                for (const name in json) {
                  newName = getClassName(name);

                  // Log transformed class names
                  // But skip this when namedExports is a function
                  // Since a user like you can manually log that if you want
                  if (name !== newName && typeof options.namedExports !== 'function') {
                    console.warn(`Exported "${name}" as "${newName}" in ${humanlizePath(this.id)}`);
                  }

                  if (!json[newName]) {
                    json[newName] = json[name];
                  }

                  output += `export var ${newName} = ${JSON.stringify(json[name])};\n`;
                }
              }

              if (shouldExtract) {
                output += `export default ${JSON.stringify(modulesExported[this.id])};`;
                extracted = {
                  id: this.id,
                  code: res.css,
                  map: outputMap
                };
              } else {
                output += `var css = ${JSON.stringify(res.css)};\nexport default ${supportModules ? JSON.stringify(modulesExported[this.id]) : 'css'};`;
              }

              if (!shouldExtract && shouldInject) {
                output += `\nimport styleInject from '${styleInjectPath}';\nstyleInject(css${Object.keys(options.inject).length > 0 ? `,${JSON.stringify(options.inject)}` : ''});`;
              }

              return $return({
                code: output,
                map: outputMap,
                extracted
              });
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  }

};

exports.postcssLoader = postcssLoader
