// Description: 사용자 컨트롤러 - 회원가입, 로그인, 로그아웃, 프로필 조회

// // src/api/controllers/user.controllers.js
// const userService = require('../services/user.services');
// const { validationResult } = require('express-validator');
// const { createError } = require('../../common/error');
//
// const userController = {
//   // 회원가입
//   async register(req, res, next) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return next(
//           createError(400, '입력 데이터가 유효하지 않습니다.', errors.array()),
//         );
//       }
//
//       const { email, password, name } = req.body;
//       const user = await userService.createUser({ email, password, name });
//
//       res.status(201).json({
//         success: true,
//         message: '회원가입이 완료되었습니다.',
//         data: { userId: user.id, email: user.email, name: user.name },
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
//
//   // 로그인
//   async login(req, res, next) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return next(
//           createError(400, '입력 데이터가 유효하지 않습니다.', errors.array()),
//         );
//       }
//
//       const { email, password } = req.body;
//       const result = await userService.loginUser({ email, password });
//
//       res.json({
//         success: true,
//         message: '로그인이 완료되었습니다.',
//         data: result,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
//
//   // 로그아웃
//   async logout(req, res, next) {
//     try {
//       const token = req.headers.authorization?.split(' ')[1];
//       await userService.logoutUser(token);
//
//       res.json({
//         success: true,
//         message: '로그아웃이 완료되었습니다.',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
//
//   // 프로필 조회
//   async getProfile(req, res, next) {
//     try {
//       const userId = req.user.id;
//       const user = await userService.getUserById(userId);
//
//       res.json({
//         success: true,
//         data: user,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// };
//
// module.exports = userController;
