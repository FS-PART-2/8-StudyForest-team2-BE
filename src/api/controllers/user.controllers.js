import { validationResult } from 'express-validator';
import { createUserService } from '../services/user.services.js';

export async function registerController(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('입력 데이터가 유효하지 않습니다.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      err.details = errors.array();
      throw err;
    }

    const { email, password, username, nick } = req.body;

    const user = await createUserService({ email, password, username, nick });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
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
