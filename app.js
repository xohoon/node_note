const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

require('dotenv').config();

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const { POINT_CONVERSION_COMPRESSED } = require('constants');

const app = express();

const connect = require('./schemas');

sequelize.sync();
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 2959);

connect();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitalized: false,
    secret : process.env.COOKIE_SECRET,
    cookie : {
        httpOnly : true,
        secure : false
    },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);

app.use((req, res, next) => {
    const err =  new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});


// socket code

// const chatRouter = require('./routes/chat');
// app.use('/chat', chatRouter);
const webSocket = require('./socket');

const ColorHash = require('color-hash');
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
});
app.use((req, res, next) => {
    if(!req.session.color) {
        console.log('why error color');
        const colorHash = new ColorHash();
        req.session.color = colorHash.hex(req.sessionID);
    }
    next();
});
// socket code

// app start
const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

webSocket(server, app);