const dotenv = require('dotenv');
dotenv.config();
const createApp = require('../src/app');
module.exports = createApp();
