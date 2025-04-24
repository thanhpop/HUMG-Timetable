// server.js
require('dotenv').config();      // load .env
const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
