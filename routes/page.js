const express = require('express');
const router = express.Router();
router.get('/profile', (req, res) => {
    res.render('profile', {
        title : '내 정보 - node_note',
        user : null
    });
});

router.get('/join', (req, res) => {
    res.render('join', {
        title : '회원가입 - node_note',
        user : null,
        joinError : req.flash('joinError')
    });
});

router.get('/', (req, res, next) => {
    res.render('main', {
        title : 'node_note',
        twits : [],
        user : null,
        loginError : req.flash('loginError')
    });
});

module.exports = router;