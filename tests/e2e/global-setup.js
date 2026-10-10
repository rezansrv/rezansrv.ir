const { execFileSync, spawn } = require('node:child_process');
const path = require('node:path');

const baseURL = 'http://127.0.0.1:4173';
const startupTimeoutMs = 120_000;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer(server, getOutput) {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Vue development server exited with code ${server.exitCode}.\n${getOutput()}`);
    }

    try {
      const response = await fetch(baseURL, {
        headers: { accept: 'text/html' },
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      // The server is still compiling; retry until the bounded deadline.
    }

    await delay(250);
  }

  throw new Error(`Vue development server was not ready within ${startupTimeoutMs} ms.\n${getOutput()}`);
}

async function stopProcessTree(server) {
  if (server.exitCode !== null) return;

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill.exe', ['/pid', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } catch {
      // The process may already have exited between the check and taskkill.
    }
  } else {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      return;
    }

    const exited = await Promise.race([
      new Promise((resolve) => server.once('exit', () => resolve(true))),
      delay(5_000).then(() => false),
    ]);

    if (!exited) {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        // The process group exited during the timeout boundary.
      }
    }
  }

  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    delay(5_000),
  ]);
}

module.exports = async () => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const cliPath = path.join(
    projectRoot,
    'node_modules',
    '@vue',
    'cli-service',
    'bin',
    'vue-cli-service.js',
  );
  let output = '';
  const rememberOutput = (chunk) => {
    output = `${output}${chunk}`.slice(-12_000);
  };
  const server = spawn(
    process.execPath,
    [cliPath, 'serve', '--host', '127.0.0.1', '--port', '4173'],
    {
      cwd: projectRoot,
      detached: process.platform !== 'win32',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  server.stdout.on('data', rememberOutput);
  server.stderr.on('data', rememberOutput);

  try {
    await waitForServer(server, () => output);
  } catch (error) {
    await stopProcessTree(server);
    throw error;
  }

  return async () => {
    await stopProcessTree(server);
  };
};
