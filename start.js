'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

var server = _child_process2.default.spawn('polymer', ['serve'], {
  // env: Object.assign({ NODE_ENV: 'development' }, process.env),
  // silent: false,
  stdio: 'inherit',
  shell: true
}, function (err, stdout, stderr) {
  if (err) {
    console.error(err);
  }
  console.log('stdout: ' + stdout);
  console.log(stderr);
});

server.once('exit', function (code, signal) {
  throw new Error('Server terminated unexpectedly with code: ' + code + ' signal: ' + signal);
});

