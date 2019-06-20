/* eslint-disable no-console */

const { spawn } = require('child_process');
const execa = require('execa');
const path = require('path');

// resolved from the root of the project
const inputDir = path.resolve('./test/fixtures/input');
const execOpts = { cwd: inputDir, stderr: 'inherit' };

(async () => {
  console.log('installing deps');

  await execa('rm', ['-rf', 'node_modules'], execOpts);
  await execa('yarn', ['install'], execOpts);

  console.log('starting serve');

  // We use spawn for this one so we can kill it later without throwing an error
  const emberServe = spawn('yarn', ['start'], execOpts);
  emberServe.stderr.pipe(process.stderr);

  await new Promise(resolve => {
    emberServe.stdout.on('data', data => {
      if (data.toString().includes('Build successful')) {
        resolve();
      }
    });
  });

  console.log('running codemod');

  await execa('../../../bin/cli.js', ['http://localhost:4200', 'app'], execOpts);

  console.log('codemod complete, ending serve');

  emberServe.kill('SIGTERM');

  console.log('comparing results');

  try {
    await execa('diff', ['-rq', './app', '../output/app'], execOpts);
  } catch (e) {
    console.error('codemod did not run successfully');
    console.log(e.stdout);

    process.exit(1);
  }

  console.log('codemod ran successfully! 🎉');
  process.exit(0);
})();
