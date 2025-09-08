// src/api/routes/user.routes.js
import express from 'express';
import {
  validateRegister,
  validateLogin,
  validateUpdateMe,
} from '../checkValidation.js';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getMeController,
  updateMeController,
} from '../controllers/user.controllers.js';


import coreMiddleware from '../../../src/common/cors.js';
import errorMiddleware from '../../../src/common/error.js'; // 에러 케이스 추가는 이 파일에서 관리
import { authenticateToken } from '../../../src/common/auth.js';



const router = express.Router();

router.use(coreMiddleware);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 회원 관련 API
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원 가입
 *     tags: [Users]
 */
router.post(
  '/register',
  validateRegister,
  errorMiddleware.asyncHandler(registerController),
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     tags: [Users]
 */
router.post(
  '/login',
  validateLogin,
  errorMiddleware.asyncHandler(loginController),
);

/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: 액세스 토큰 재발급(리프레시 토큰 필요)
 *     tags: [Users]
 */
router.post('/refresh', errorMiddleware.asyncHandler(refreshTokenController));

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: 로그아웃(리프레시 토큰 무효화)
 *     tags: [Users]
 */
router.post('/logout', errorMiddleware.asyncHandler(logoutController));
// 내 프로필 조회
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 프로필 조회
 *     description: 현재 로그인한 사용자의 프로필을 반환합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 성공
 */
router.get(
  '/me',
  authenticateToken,
  errorMiddleware.asyncHandler(getMeController),
);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: 내 프로필 수정
 *     description: 닉네임/아이디/이메일 변경, 비밀번호 변경(currentPassword/newPassword) 지원
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nick: { type: string, example: "홍대장" }
 *               username: { type: string, example: "hong123" }
 *               email: { type: string, format: email, example: "hong@ex.com" }
 *               currentPassword: { type: string, example: "Abcd1234" }
 *               newPassword: { type: string, example: "Qwer5678" }
 *     responses:
 *       '200': { description: 업데이트 성공 }
 *       '400': { description: 검증 실패 / 현재 비번 불일치 / 변경필드 없음 }
 *       '409': { description: 중복 username/email }

router.patch(
  '/me',
  authenticateToken,
  validateUpdateMe,
  errorMiddleware.asyncHandler(updateMeController),
);

// 에러 핸들러(맨 마지막)
router.use(errorMiddleware.errorHandler);

export default router;
