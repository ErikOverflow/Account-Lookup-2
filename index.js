const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const v1 = express.Router();
const v2 = express.Router();

app.use('/api/v1', v1);
app.use('/api/v2', v2);

v1.get('/ping', (req,res) => res.status(200).send("Successful"));
const {ping} = require('./services/ping');
v2.get('/ping', ping);

app.listen(process.env.PORT, () => console.log("app is listening"));