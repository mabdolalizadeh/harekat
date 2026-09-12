import routes from './src/routes/index.js';

function printRoutes(router, prefix = '') {
  router.stack.forEach((layer, i) => {
    if (layer.route) {
      console.log(prefix + layer.route.path, Object.keys(layer.route.methods));
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const regexStr = layer.regexp ? layer.regexp.toString() : 'no regexp';
      const match = regexStr.match(/^\/\^\\\/(.+)\/.*$/);
      const path = match ? match[1].replace(/\\\\/g, '') : regexStr;
      console.log(prefix + ' -> ' + path + ' (sub-router)');
      printRoutes(layer.handle, prefix + '/' + path);
    } else {
      console.log(prefix + ' -> layer ' + i + ': ' + (layer.name || layer.handle?.name || 'unknown'));
    }
  });
}

printRoutes(routes);