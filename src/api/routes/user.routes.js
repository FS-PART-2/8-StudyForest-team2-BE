import express from 'express';
import { validateRegister, validateLogin } from '../checkValidation.js';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from '../controllers/user.controllers.js';

import coreMiddleware from '../../../src/common/cors.js';
import errorMiddleware from '../../../src/common/error.js'; // 에러 케이스 추가는 이 파일에서 관리

const router = express.Router();
router.use(coreMiddleware); // CORS 미들웨어 적용

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 회원 관련 API
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: 회원 가입
 *     description: 새 사용자를 등록합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - nick
 *             properties:
 *               username:
 *                 type: string
 *                 example: "hong"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "hong@example.com"
 *               password:
 *                 type: string
 *                 description: "8~16자, 대/소문자 및 숫자 포함"
 *                 example: "Abcd1234"
 *               nick:
 *                 type: string
 *                 example: "홍길동"
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "회원가입이 완료되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "hong"
 *                     email:
 *                       type: string
 *                       example: "hong@example.com"
 *                     nick:
 *                       type: string
 *                       example: "홍길동"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: 잘못된 요청 (유효성 검사 실패, 비밀번호 정책 위반 등)
 *       '409':
 *         description: 중복된 이메일 또는 사용자명
 */
router.post(
  '/register',
  validateRegister,
  errorMiddleware.asyncHandler(registerController),
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: 로그인
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "hong@example.com" }
 *               password: { type: string, example: "Abcd1234" }
 *     responses:
 *       '200': { description: 로그인 성공(액세스 토큰 반환, 리프레시 토큰은 httpOnly 쿠키) }
 *       '400': { description: 유효성 검사 실패 }
 *       '401': { description: 잘못된 자격 증명 }
 */
router.post(
  '/login',
  validateLogin,
  errorMiddleware.asyncHandler(loginController),
);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: 액세스 토큰 재발급(리프레시 토큰 필요)
 *     tags: [Users]
 *     responses:
 *       '200': { description: 재발급 성공 }
 *       '401': { description: 리프레시 토큰 누락/무효 }
 */
router.post('/refresh', errorMiddleware.asyncHandler(refreshTokenController));

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: 로그아웃(리프레시 토큰 무효화)
 *     tags: [Users]
 *     responses:
 *       '200': { description: 로그아웃 성공 }
 */
router.post('/logout', errorMiddleware.asyncHandler(logoutController));

// // 프로필 조회 (인증 필요)
// router.get('/profile', authenticateToken, userController.getProfile);
//

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
