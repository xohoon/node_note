const express = require('express');

const Room = require('../schemas/room');
const Chat = require('../schemas/chat');
const body = require('body-parser');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
      const rooms = await Room.find({ });
      res.render('chat_main', { 
        rooms, 
        title: 'GIF 채팅방',
        userNick: req.param('userNick')
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  router.get('/room', (req, res) => {
    res.render('chat_room', { 
      title: 'GIF 채팅방 생성',
      userNick: req.param('userNick')
    });
  });
  
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
  
  router.get('/room/:id', async (req, res, next) => {
    try {
      const room = await Room.find({ _id: req.params.id });
      const io = req.app.get('io');
      if (!room) {
        return res.redirect('/?error=존재하지 않는 방입니다.');
      }
      if (room.password && room.password !== req.query.password) {
        return res.redirect('/?error=비밀번호가 틀렸습니다.');
      }
      const { rooms } = io.of('/chat').adapter;
      if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
        return res.redirect('/?error=허용 인원이 초과하였습니다.');
      }
      return res.render('chat_chat', {
        room,
        title: room.title,
        chats: [],
        user: req.session.color,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
  
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
module.exports = router;