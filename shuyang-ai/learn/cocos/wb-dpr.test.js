/**
 * node shuyang-ai/learn/cocos/wb-dpr.test.js
 */
var dpr = require('./wb-dpr.js');

function fail(msg) {
  console.error('FAIL ' + msg);
  process.exitCode = 1;
}

if (dpr.cap(1) !== 1) fail('dpr 1');
if (dpr.cap(2) !== 2) fail('dpr 2');
if (dpr.cap(3) !== 3) fail('dpr 3');
if (dpr.cap(3.5) !== 3) fail('dpr 3.5 cap');
if (dpr.cap(0) !== 1) fail('dpr 0');
if (dpr.cap(undefined) !== 1) fail('dpr missing');
if (!dpr.patch) fail('patch missing');

if (process.exitCode) console.error('wb-dpr tests failed');
else console.log('wb-dpr tests ok');
