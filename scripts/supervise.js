// Keeps the server running: restarts it whenever it exits unexpectedly.
// Needed because some crashes (e.g. the Windows libuv assertion
// "new_time >= loop->time" in src\win\core.c) abort the process natively and
// cannot be caught from JavaScript.
//
//   node scripts/supervise.js         -> nodemon (restarts on file changes and on crashes)
//   node scripts/supervise.js --prod  -> plain node index.js (restarts on crashes)
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const prod = process.argv.includes('--prod');
const args = prod
    ? [path.join(root, 'index.js')]
    // --exitcrash makes nodemon exit on a crash instead of waiting for a file change.
    : [require.resolve('nodemon/bin/nodemon.js', { paths: [root] }), '--exitcrash', 'index.js'];

const RAPID_WINDOW_MS = 60 * 1000;
let recentCrashes = [];
let child = null;
let stopping = false;

function start() {
    child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
    child.on('exit', (code, signal) => {
        child = null;
        if (stopping) return;

        const now = Date.now();
        recentCrashes = recentCrashes.filter(t => now - t < RAPID_WINDOW_MS).concat(now);
        // Back off if it keeps crashing right away, so a startup bug doesn't spin the CPU.
        const delay = Math.min(1000 * 2 ** (recentCrashes.length - 1), 30000);
        console.error(`[supervise] server exited (${signal || `code ${code}`}); restarting in ${delay / 1000}s`);
        setTimeout(start, delay);
    });
}

function stop() {
    stopping = true;
    if (child) child.kill();
    process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

start();
