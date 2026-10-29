const { PORT } = require('./src/config');
const connectDB = require('./src/config/database');
const app = require('./src/app');

// Without these, an uncaught exception or a rejected promise with no .catch
// anywhere in the call chain crashes the whole process silently (no log),
// taking down every in-flight request. Log with full context then exit so
// scripts/supervise.js can restart cleanly, instead of leaving the process
// in a broken, hung, or half-crashed state.
process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
    process.exit(1);
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('[connectDB] failed to connect:', err);
    process.exit(1);
});
