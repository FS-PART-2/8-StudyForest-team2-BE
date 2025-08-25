// Description: 유저 라우터 - 회원가입, 로그인, 로그아웃, 프로필 조회

// // src/api/routes/user.routes.js
// const express = require('express');
// const userController = require('../controllers/user.controllers');
// const { validateRegister, validateLogin } = require('../checkValidation');
// const { authenticateToken } = require('../../common/auth');
//
// const router = express.Router();
//
// // 회원가입
// router.post('/register', validateRegister, userController.register);
//
// // 로그인
// router.post('/login', validateLogin, userController.login);
//
// // 로그아웃 (인증 필요)
// router.post('/logout', authenticateToken, userController.logout);
//
// // 프로필 조회 (인증 필요)
// router.get('/profile', authenticateToken, userController.getProfile);
//
// module.exports = router;
