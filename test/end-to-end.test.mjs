/* eslint-disable no-console */

const { spawn } = require('child_process');
const execa = require('execa');
const path = require('path');

// resolved from the root of the project
const inputDir = path.resolve('./test/fixtures/input');
const execOpts = { cwd: inputDir, stderr: 'inherit' };

import { afterAll, beforeAll, describe, it } from 'vitest';

const APP_TIMEOUT = 100000;

describe('end-to-end test', () => {
  let emberServe;

  beforeAll(async () => {
    console.log('starting serve');

    // We use spawn for this one so we can kill it later without throwing an error
    emberServe = spawn('pnpm', ['start'], execOpts);
    emberServe.stderr.pipe(process.stderr);

    await new Promise((resolve) => {
      emberServe.stdout.on('data', (data) => {
        if (data.toString().includes('Build successful')) {
          resolve();
        }
      });
    });
  }, APP_TIMEOUT);

  afterAll(async () => {
    emberServe.kill();
  }, APP_TIMEOUT);

  it(
    'works',
    async () => {
      console.log('running codemod');

      const codemodProcess = execa(
        '../../../bin/cli.js',
        ['http://localhost:4200', 'app', 'lib/special-sauce/addon'],
        execOpts
      );
      codemodProcess.stdout.pipe(process.stdout);

      await codemodProcess;

      console.log('codemod complete, ending serve');

      emberServe.kill('SIGTERM');

      console.log('comparing results');

      try {
        await execa('diff', ['-rq', './app', '../output/app'], execOpts);
        await execa('diff', ['-rq', './lib', '../output/lib'], execOpts);
      } catch (e) {
        console.error('codemod did not run successfully');
        console.log(e.stdout);
        throw e;
      }

      console.log('codemod ran successfully! 🎉');
    },
    { timeout: APP_TIMEOUT * 2 }
  );
});
