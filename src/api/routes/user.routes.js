import express from 'express';
import { validateRegister } from '../checkValidation.js';
import { registerController } from '../controllers/user.controllers.js';
import coreMiddleware from '../../../src/common/cors.js';
import errorMiddleware from '../../../src/common/error.js'; // 에러 케이스 추가는 이 파일에서 관리

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 회원 관련 API
 *
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
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "hong"
 *                 email:
 *                   type: string
 *                   example: "hong@example.com"
 *                 nick:
 *                   type: string
 *                   example: "홍길동"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
// // 로그인
// router.post('/login', validateLogin, userController.login);
//
// // 로그아웃 (인증 필요)
// router.post('/logout', authenticateToken, userController.logout);
//
// // 프로필 조회 (인증 필요)
// router.get('/profile', authenticateToken, userController.getProfile);
//
router.use(coreMiddleware); // CORS 미들웨어 적용

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
