// Description: API를 위한 라우터 설정 코드 파일입니다.
// 라이브러리 정의

/**
 * @swagger
 * tags:
 *   - name: Studies
 *     description: 스터디 관리 API
 *
 * components:
 *   schemas:
 *     Study:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         nick:
 *           type: string
 *           example: kimdy
 *         name:
 *           type: string
 *           example: 스터디
 *         content:
 *           type: string
 *           example: Nest.js 스터디
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://...
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-02T03:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-02T05:22:33.000Z
 *
 *     StudyDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             pointsSum:
 *               type: integer
 *               example: 1234
 *             _count:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                   example: 42
 *                 studyEmojis:
 *                   type: integer
 *                   example: 5
 *                 habitHistories:
 *                   type: integer
 *                   example: 10
 *             studyEmojis:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   emoji:
 *                     type: string
 *                     example: 👍
 *                   count:
 *                     type: integer
 *                     example: 13
 *             habitHistories:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   weekDate:
 *                     type: string
 *                     format: date
 *                   habits:
 *                     type: array
 *                     items:
 *                       type: object
 *
 *     StudyManageItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                 habitHistories:
 *                   type: integer
 *                 focuses:
 *                   type: integer
 *                 studyEmojis:
 *                   type: integer
 *
 *     StudyListResponse:
 *       type: object
 *       properties:
 *         studies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Study'
 *         totalCount:
 *           type: integer
 *           example: 57
 *
 *     StudyCreateInput:
 *       type: object
 *       required:
 *         - nick
 *         - name
 *         - content
 *         - password
 *         - checkPassword
 *       properties:
 *         nick:
 *           type: string
 *           example: kimdy
 *         name:
 *           type: string
 *           example: 스터디
 *         content:
 *           type: string
 *           example: Nest.js 스터디
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://...
 *         password:
 *           type: string
 *           example: plain-password
 *         checkPassword:
 *           type: string
 *           example: plain-password
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     StudyUpdateInput:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         nick:
 *           type: string
 *           example: kimdy2
 *         name:
 *           type: string
 *           example: 스터디(수정)
 *         content:
 *           type: string
 *           example: 수정된 스터디 입니다.
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://...
 *         isActive:
 *           type: boolean
 *           example: false
 *         password:
 *           type: string
 *           description: 수정 인증용 평문 비밀번호(서버에서 검증)
 *           example: plain-password
 *
 *     StudyDeleteInput:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           description: 삭제 인증용 평문 비밀번호(서버에서 검증)
 *           example: plain-password
 *
 *     EmojiUpdateInput:
 *       type: object
 *       required:
 *         - emoji
 *       properties:
 *         emoji:
 *           type: string
 *           description: '증감할 이모지 문자 (예: "👍" 또는 "heart")'
 *           example: 👍
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: 비밀번호가 누락되었습니다.
 *         code:
 *           type: string
 *           example: PASSWORD_REQUIRED
 *
 *   parameters:
 *     StudyIdParam:
 *       name: studyId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *       description: 스터디 ID
 */

/**
 * @swagger
 * /api/studies/manage:
 *   get:
 *     tags: [Studies]
 *     summary: 관리용 전체 스터디 목록 조회
 *     description: 관리자 화면용 상세 필드/카운트 포함 목록
 *     responses:
 *       200:
 *         description: 스터디 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudyManageItem' }
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @swagger
 * /api/studies:
 *   get:
 *     tags: [Studies]
 *     summary: 스터디 목록 조회
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0 }
 *         example: 0
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50 }
 *         example: 6
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: 이름 부분 일치(대소문자 무시)
 *       - in: query
 *         name: pointOrder
 *         schema: { type: string, enum: [asc, desc] }
 *         example: desc
 *       - in: query
 *         name: recentOrder
 *         schema: { type: string, enum: [recent, old] }
 *         example: recent
 *     responses:
 *       200:
 *         description: 목록 및 총계
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudyListResponse' }
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyCreateInput' }
 *     responses:
 *       201:
 *         description: 생성 성공
 *         headers:
 *           Location:
 *             description: 생성된 리소스 경로(`api/studies/{id}`)
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Study' }
 *       400:
 *         description: 유효성 오류(비밀번호 미일치 등)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/studies/{studyId}:
 *   get:
 *     tags: [Studies]
 *     summary: 스터디 상세 조회
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     responses:
 *       200:
 *         description: 상세
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudyDetail' }
 *       400:
 *         description: 잘못된 ID
 *       404:
 *         description: 존재하지 않는 스터디
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   patch:
 *     tags: [Studies]
 *     summary: 스터디 수정
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyUpdateInput' }
 *     responses:
 *       200:
 *         description: 수정된 스터디
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Study' }
 *       400:
 *         description: 유효성 오류/비밀번호 누락
 *       403:
 *         description: 비밀번호 불일치
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 *   delete:
 *     tags: [Studies]
 *     summary: 스터디 삭제
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyDeleteInput' }
 *     responses:
 *       204:
 *         description: 삭제 성공(본문 없음)
 *       400:
 *         description: 비밀번호 누락 등
 *       403:
 *         description: 비밀번호 불일치
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 *  /api/studies/{studyId}/emojis:
 *   post:
 *     tags: [Studies]
 *     summary: '스터디 이모지 업데이트'
 *     description: '본문의 emoji 값을 사용해 해당 이모지 카운트를 업데이트합니다.'
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmojiUpdateInput' }
 *     responses:
 *       200:
 *         description: '업데이트 성공'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 studyId: 101
 *                 emojis:
 *                   - emoji: '👍'
 *                     count: 13
 *       400:
 *         description: '유효성 오류(emoji 누락 등)'
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: '대상 스터디 없음'
 *       500:
 *         description: '서버 에러'
 */

import express from 'express';

// 미들웨어 정의
import corsMiddleware from '../../common/cors.js';
import errorMiddleware from '../../common/error.js'; // 에러를 추가할 일이 있다면, 해당 파일에 케이스를 추가해주시기 바랍니다.

// 컨트롤러 정의
import studyController from '../controllers/study.controllers.js';

const router = express.Router();

router.use(corsMiddleware); // CORS 미들웨어 적용

// 관리를 위한 전체 스터디 목록 조회 API 엔드포인트
router.get(
  '/manage',
  errorMiddleware.asyncHandler(studyController.controlGetStudy),
);

// 스터디 목록 조회 API 엔드포인트
router.get('/', errorMiddleware.asyncHandler(studyController.controlStudyList));

// 스터디 생성 API 엔드포인트
router.post(
  '/',
  errorMiddleware.asyncHandler(studyController.controlStudyCreate),
);

// 스터디 수정 API 엔드포인트
router.patch(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyUpdate),
);

// 스터디 삭제 API 엔드포인트
router.delete(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyDelete),
);

// 스터디 상세조회 API 엔드포인트
router.get(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyDetail),
);

// 이모지 횟수 증가 API 엔드포인트
router.post(
  '/:studyId/emojis/increment',
  errorMiddleware.asyncHandler(studyController.controlEmojiIncrement),
);

// 이모지 횟수 감소 API 엔드포인트
router.post(
  '/:studyId/emojis/decrement',
  errorMiddleware.asyncHandler(studyController.controlEmojiDecrement),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
