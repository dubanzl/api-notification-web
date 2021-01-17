require("dotenv").config();

const express = require("express");
const morgan = require('morgan');
var cors = require('cors')

const app = express();
app.use(cors());

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Routes
app.use(require('./routes/index'));

app.listen(3000);
console.log('Server Listening...');
