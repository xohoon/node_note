const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { 
        title : '내 정보 - node_note', 
        user : req.user 
    });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title : '회원가입 - node_note',
        user : req.user,
        joinError : req.flash('joinError'),
    });
});

router.get('/', (req, res, next) => {
    res.render('main', {
        title : 'node_note',
        twits : [],
        user : req.user,
        loginError : req.flash('loginError')
    });
});

module.exports = router;