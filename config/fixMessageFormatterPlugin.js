// @see: https://github.com/facebook/create-react-app/issues/9880

// @ts-check

/**
 * formatWebpackMessages helper from Create-react-app expects errors and warnings to be
 * arrays of strings as they are in Webpack 4.
 * Webpack 5 changed them to objects.
 * This plugin changes them back to strings until the issue is resolved
 * https://github.com/facebook/create-react-app/issues/9880
 */
class FixMessageFormatterPlugin {
  /** @type {import('webpack').WebpackPluginFunction} */
  apply = compiler => {
    compiler.hooks.compilation.tap('FixMessageFormatterPlugin', compilation => {
      compilation.hooks.statsFactory.tap('FixMessageFormatterPlugin', stats => {
        stats.hooks.result
          .for('error')
          .tap('FixMessageFormatterPlugin', (obj, data, ctx) =>
            formatError(obj, 'ERROR'),
          );

        stats.hooks.result
          .for('warning')
          .tap('FixMessageFormatterPlugin', (obj, data, ctx) =>
            formatError(obj, 'WARNING'),
          );
      });
    });
  };
}

function formatError(obj, prefix = '') {
  const moduleName = obj.moduleName;
  const location = obj.loc;

  if (moduleName) {
    prefix = `${moduleName}\n${prefix}`.trim();

    if (location) {
      prefix = `${prefix} in ${location}`.trim();
    }
  }

  return `${prefix ? prefix + '\n' : ''}${obj.message}`;
}

module.exports = FixMessageFormatterPlugin;
