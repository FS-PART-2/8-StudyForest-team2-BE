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
 *   get:
 *     summary: 스터디별 집중 시간 목록 조회
 *     tags: [Focus]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 스터디 ID
 *     responses:
 *       200:
 *         description: 성공적으로 조회됨
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   setTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-11T23:41:08.354Z"
 *       400:
 *         description: 잘못된 스터디 ID
 *       404:
 *         description: 존재하지 않는 스터디
 *
 *   patch:
 *     summary: 스터디 집중 시간 갱신
 *     tags: [Focus]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
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
 *               - minuteData
 *               - secondData
 *             properties:
 *               minuteData:
 *                 type: integer
 *                 minimum: 0
 *                 description: 분 단위 (0 이상)
 *                 example: 10
 *               secondData:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *                 description: 초 단위 (0 이상 59 이하)
 *                 example: 30
 *     responses:
 *       200:
 *         description: 성공적으로 업데이트됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 setTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-10T02:29:29.866Z"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-09T01:14:31.143Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-10T02:19:29.866Z"
 *                 studyId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: 유효하지 않은 입력값
 *       404:
 *         description: 존재하지 않는 스터디
 */

router.get(
  '/:studyId',
  errorMiddleware.asyncHandler(focusControllers.controlGetList),
);

router.patch(
  '/:studyId',
  errorMiddleware.asyncHandler(focusControllers.controlUpdateFocus),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
