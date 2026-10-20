require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CHATGPT_API_KEY: process.env.CHATGPT_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-6-luna',
    OPENAI_REASONING_EFFORT: process.env.OPENAI_REASONING_EFFORT || 'low',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};
