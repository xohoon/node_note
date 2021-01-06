const express = require('express');

const Room = require('../schemas/room');
const Chat = require('../schemas/chat');
const body = require('body-parser');
const router = express.Router();

// 채팅 메인 페이지
router.get('/main', async (req, res, next) => {
  try {
    const rooms = await Room.find({ });
    res.render('chat/main', {
      rooms, 
      title: 'GIF 채팅방',
      userNick: req.param('userNick')
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 채팅방 생성 페이지
router.get('/room', (req, res) => {
  console.log('TEST!!'+req.param('userNick'));
  res.render('chat/room', {
    title: 'GIF 채팅방 생성',
    userNick: req.param('userNick'),
  });
});

// 채팅방 생성
router.post('/room', async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      // owner: req.session.color,
      owner: req.body.userNick,
      password: req.body.password,
    });
    const io = req.app.get('io');
    io.of('/room').emit('newRoom', newRoom);
    res.redirect(`/chat/room/${newRoom._id}?password=${req.body.password}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
 
// 채팅방 페이지
router.get('/room/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get('io');
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.');
    }
    if (room.password && room.password !== req.query.password) {
      return res.redirect('/?error=비밀번호가 틀렸습니다.');
    }
    const { rooms } = io.of('/chat_chat').adapter;
    if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
      return res.redirect('/?error=허용 인원이 초과하였습니다.');
    }

    const chats = await Chat.findOne({ room: room._id }).sort('createAt');
    return res.render('chat/chat', {
      room,
      title: room.title,
      chats: [],
      // user: req.session.color,
      user: req.param('userNick'),
      userNick: req.param('userNick'),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 채팅방 삭제
router.delete('/room/:id', async (req, res, next) => {
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send('ok');
    setTimeout(() => {
      req.app.get('io').of('/room').emit('removeRoom', req.params.id);
    }, 2000);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/room/:id/chat', async (req, res, next) => {
  console.log('어디옴');
  try {
    const chat = new Chat({
      room: req.params.id,
      // user: req.session.color,
      user: req.body.userNick,
      chat: req.body.chat,
    });
    await chat.save();
    req.app.get('io').of('/chat/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  }catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;