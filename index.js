const { PORT } = require('./src/config');
const connectDB = require('./src/config/database');
const app = require('./src/app');

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
