// Description: API를 위한 라우터 설정 코드 파일입니다.
import express from 'express';
// eslint-disable-next-line import/extensions
import coreMiddleware from '../../common/cors.js';
// eslint-disable-next-line import/extensions,import/no-named-as-default,import/no-named-as-default-member
import errorMiddleware from '../../common/error.js';

// eslint-disable-next-line import/extensions,import/no-named-as-default,import/no-named-as-default-member
import focusControllers from '../controllers/focus.controllers.js';

const router = express.Router();

router.use(coreMiddleware); // CORS 미들웨어 적용

/**
 * @swagger
 * tags:
 *   name: Focus
 *   description: 스터디 집중 시간 관리 API
 */

/**
 * @swagger
 * /api/focus/{studyId}:
 *   patch:
 *     summary: 스터디 포인트 갱신
 *     description: 특정 스터디의 포인트를 누적 갱신합니다.
 *     tags: [Focus]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         description: 포인트를 갱신할 스터디 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalPoints
 *             properties:
 *               totalPoints:
 *                 type: integer
 *                 minimum: 0
 *                 description: 누적할 포인트 값 (0 이상)
 *                 example: 50
 *     responses:
 *       200:
 *         description: 포인트 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 point:
 *                   type: integer
 *                   description: 갱신 후 누적 포인트
 *                   example: 795
 *       400:
 *         description: 잘못된 요청 (point 값이 0 미만이거나 형식 오류)
 *       404:
 *         description: 해당 studyId에 대한 포인트 정보 없음
 */

router.patch(
  '/:studyId',
  errorMiddleware.asyncHandler(focusControllers.controlUpdateFocus),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
