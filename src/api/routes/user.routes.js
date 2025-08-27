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

// import express from 'express';
// import { Prisma } from '@prisma/client';
// import coreMiddleware from '../../../src/common/cors.js';
// import errorMiddleware from '../../../src/common/error.js'; // 에러를 추가할 일이 있다면, 해당 파일에 케이스를 추가해주시기 바랍니다.
//
// const router = express.Router();
//
// router.use(coreMiddleware); // CORS 미들웨어 적용
// router.use(express.json());
//
// // 예시 API 엔드포인트
// router.get(
//   '/example-API',
//   errorMiddleware.asyncHandler(async (req, res) => {
//     res.json({ status: 'OK', message: 'This is example API' });
//   }),
// );
//
// // 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
// router.use(errorMiddleware.errorHandler);
//
// export default router;
