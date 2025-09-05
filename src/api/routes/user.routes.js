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

import coreMiddleware from '../../common/cors.js';
import errorMiddleware from '../../common/error.js';
import { authenticateToken } from '../../common/auth.js';

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
 * /users/register:
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
 * /users/login:
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
 * /users/refresh:
 *   post:
 *     summary: 액세스 토큰 재발급(리프레시 토큰 필요)
 *     tags: [Users]
 */
router.post('/refresh', errorMiddleware.asyncHandler(refreshTokenController));

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: 로그아웃(리프레시 토큰 무효화)
 *     tags: [Users]
 */
router.post('/logout', errorMiddleware.asyncHandler(logoutController));

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 프로필 조회
 *     tags: [Users]
 */
router.get(
  '/me',
  authenticateToken,
  errorMiddleware.asyncHandler(getMeController),
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: 내 프로필 수정
 *     tags: [Users]
 */
router.patch(
  '/me',
  authenticateToken,
  validateUpdateMe,
  errorMiddleware.asyncHandler(updateMeController),
);

// 에러 핸들러(맨 마지막)
router.use(errorMiddleware.errorHandler);

export default router;
