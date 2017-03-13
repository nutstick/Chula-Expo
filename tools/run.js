'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

function format(time) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function run(fn, options) {
  var task = typeof fn.default === 'undefined' ? fn : fn.default;
  var start = new Date();
  console.log('[' + format(start) + '] Starting \'' + task.name + (options ? ' (' + options + ')' : '') + '\'...');
  return task(options).then(function (resolution) {
    var end = new Date();
    var time = end.getTime() - start.getTime();
    console.log('[' + format(end) + '] Finished \'' + task.name + (options ? ' (' + options + ')' : '') + '\' after ' + time + ' ms');
    return resolution;
  });
}

if (require.main === module && process.argv.length > 2) {
  delete require.cache[__filename]; // eslint-disable-line no-underscore-dangle
  var _module = require('./' + process.argv[2] + '.js').default; // eslint-disable-line import/no-dynamic-require
  run(_module).catch(function (err) {
    console.error(err.stack);process.exit(1);
  });
}

exports.default = run;
