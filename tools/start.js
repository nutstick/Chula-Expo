/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import cp from 'child_process';
const server = cp.spawn('polymer', ['serve', '--hostname', '0.0.0.0'], {
  // env: Object.assign({ NODE_ENV: 'development' }, process.env),
  // silent: false,
  stdio: 'inherit',
  shell: true
}, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
  }
  console.log(`stdout: ${stdout}`);
  console.log(stderr);
})

server.once('exit', (code, signal) => {
  throw new Error(`Server terminated unexpectedly with code: ${code} signal: ${signal}`);
});