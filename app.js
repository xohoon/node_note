const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const pagerouter = require('./routes/page');

const app = expree();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('post', process.env.PORT || 8001);