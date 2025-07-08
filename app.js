const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const INIT_DATABASE = require('./app/config/database');
const apiRoutes = require('./app/routes/index')
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', apiRoutes);

INIT_DATABASE();
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}...`);
});