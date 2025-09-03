// Description: API를 위한 라우터 설정 코드 파일입니다.
// 라이브러리 정의

/**
 * @swagger
 * tags:
 *   - name: Studies
 *     description: 스터디 관리 API
 *
 * components:
 *   parameters:
 *     StudyIdParam:
 *       name: studyId
 *       in: path
 *       required: true
 *       schema: { type: integer, minimum: 1 }
 *       description: 스터디 ID
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: 비밀번호가 누락되었습니다. }
 *         code:
 *           type: string
 *           description: 애플리케이션 정의 오류 코드
 *           example: PASSWORD_REQUIRED
 *
 *     Study:
 *       type: object
 *       description: 스터디 기본 객체
 *       properties:
 *         id: { type: integer, example: 101 }
 *         nick: { type: string, example: kimdy }
 *         name: { type: string, example: 알고리즘 스터디 }
 *         content: { type: string, example: 매주 토요일 10시 온라인 진행 }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner.png
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
 *           example: 2025-09-02T03:00:00.000Z
 *
 *     StudyManageItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 points: { type: integer, example: 12 }
 *                 habitHistories: { type: integer, example: 4 }
 *                 focuses: { type: integer, example: 7 }
 *                 studyEmojis: { type: integer, example: 3 }
 *
 *     StudyListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             points:
 *               type: array
 *               description: 포인트 엔티티 배열(필드 구조는 내부 구현을 따름)
 *               items: { type: object, additionalProperties: true }
 *             studyEmojis:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count: { type: integer, example: 13 }
 *                   emoji:
 *                     type: object
 *                     properties:
 *                       symbol: { type: string, example: 👍 }
 *             habitHistories:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   weekDate:
 *                     type: string
 *                     format: date
 *                     example: 2025-08-31
 *                   habits:
 *                     type: array
 *                     items: { type: object, additionalProperties: true }
 *             focuses:
 *               type: array
 *               items: { type: object, additionalProperties: true }
 *
 *     StudyListResponse:
 *       type: object
 *       properties:
 *         totalCount: { type: integer, example: 127 }
 *         studies:
 *           type: array
 *           items: { $ref: '#/components/schemas/StudyListItem' }
 *
 *     StudyDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             studyEmojis:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count: { type: integer, minimum: 0, example: 8 }
 *                   emoji:
 *                     type: object
 *                     properties:
 *                       symbol: { type: string, example: 👍 }
 *             habitHistories:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   weekDate:
 *                     type: string
 *                     format: date
 *                     example: 2025-08-31
 *                   habits:
 *                     type: array
 *                     items: { type: object, additionalProperties: true }
 *             _count:
 *               type: object
 *               properties:
 *                 points: { type: integer, example: 12 }
 *                 studyEmojis: { type: integer, example: 3 }
 *                 habitHistories: { type: integer, example: 4 }
 *             pointsSum:
 *               type: integer
 *               description: 포인트 합계
 *               example: 42
 *
 *     StudyCreateInput:
 *       type: object
 *       required: [nick, name, content, password, checkPassword]
 *       properties:
 *         nick: { type: string, example: kimdy }
 *         name: { type: string, example: 알고리즘 스터디 }
 *         content: { type: string, example: 매주 토요일 10시 온라인 진행 }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner.png
 *         password: { type: string, example: 'p@ssW0rd!' }
 *         checkPassword: { type: string, example: 'p@ssW0rd!' }
 *         isActive: { type: boolean, example: true }
 *
 *     StudyUpdateInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         nick: { type: string, example: kimdy2 }
 *         name: { type: string, example: 스터디(수정) }
 *         content: { type: string, example: 수정된 스터디 입니다. }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner2.png
 *         password: { type: string, example: 'p@ssW0rd!' }
 *         isActive: { type: boolean, example: true }
 *
 *     StudyDeleteInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         password: { type: string, example: 'p@ssW0rd!' }
 *
 *     EmojiCountInput:
 *       type: object
 *       required: [id, count]
 *       properties:
 *         id:
 *           description: 이모지 식별자(심볼 또는 정수 ID)
 *           oneOf:
 *             - type: string
 *               description: 이모지 유니코드 코드포인트(16진수)
 *               pattern: '^[0-9a-fA-F]{4,8}$'
 *               example: 1f603
 *         count:
 *           type: integer
 *           minimum: 1
 *           description: 증가/감소 수량(양의 정수)
 *           example: 1
 *
 *     StudyEmoji:
 *       type: object
 *       properties:
 *         studyId: { type: integer, example: 101 }
 *         emojiId: { type: integer, example: 12 }
 *         count: { type: integer, example: 13 }
 *         emoji:
 *           type: object
 *           properties:
 *             symbol: { type: string, example: 👍 }
 *
 *     EmojiUpdated:
 *       allOf:
 *         - $ref: '#/components/schemas/StudyEmoji'
 *
 *     EmojiDeleted:
 *       type: object
 *       properties:
 *         deleted: { type: boolean, example: true }
 *         studyId: { type: integer, example: 101 }
 *         emojiId:
 *           type: integer
 *           nullable: true
 *           example: 12
 *         count: { type: integer, example: 0 }
 *         reason:
 *           type: string
 *           nullable: true
 *           description: 'not-exists | emoji-not-found | race 등'
 *           example: 'not-exists'
 *
 *     EmojiActionResult:
 *       oneOf:
 *         - $ref: '#/components/schemas/EmojiUpdated'
 *         - $ref: '#/components/schemas/EmojiDeleted'
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
 *         example: 알고리즘
 *       - in: query
 *         name: pointOrder
 *         schema: { type: string, enum: [asc, desc] }
 *         example: desc
 *       - in: query
 *         name: recentOrder
 *         schema: { type: string, enum: [recent, old] }
 *         example: recent
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *         example: true
 *     description: |
 *       - offset: (선택) 건너뛸 레코드 수(기본값 0)
 *       - limit: (선택) 최대 조회 건수(기본값 6, 최대 50)
 *       - keyword: (선택) 스터디 이름/닉네임/내용 검색 키워드(부분 일치)
 *       - pointOrder: (선택) 포인트 합계 기준 정렬(asc/desc, 기본값 desc)
 *       - recentOrder: (선택) 생성일 기준 정렬(recent/old, 기본값 recent)
 *       - active: (선택) 활성화 상태 필터(true/false, 미지정 시 전체)
 *     responses:
 *       200:
 *         description: 페이징 목록
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudyListResponse' }
 *       500:
 *         description: 서버 에러
 *
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
 *             description: 생성된 리소스 경로(`/api/studies/{id}`)
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
 *       500:
 *         description: 서버 에러
 *
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
 *         description: 유효성 오류
 *       403:
 *         description: 비밀번호 불일치 등
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 *
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
 * /api/studies/{studyId}/emojis/increment:
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 이모지 카운트 증가
 *     description: 요청 본문의 id(이모지 심볼/식별자)와 count(증가 수량)를 사용합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmojiCountInput' }
 *     responses:
 *       200:
 *         description: 증가 후 최신 레코드
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EmojiUpdated' }
 *       400:
 *         description: 유효성 오류(id/count 누락/형식 불일치)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: 대상 스터디 없음
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/studies/{studyId}/emojis/decrement:
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 이모지 카운트 감소/삭제
 *     description: 현재 카운트보다 많이 감소 요청 시 레코드가 삭제될 수 있습니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmojiCountInput' }
 *     responses:
 *       200:
 *         description: 감소 결과(감소 또는 삭제)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EmojiActionResult' }
 *       400:
 *         description: 유효성 오류(id/count 누락/형식 불일치)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: 대상 스터디 없음
 *       500:
 *         description: 서버 에러
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

// 습관 기록표 API 엔드포인트
router.post(
  '/:studyId/habit-history',
  errorMiddleware.asyncHandler(studyController.controlSetHabitHistory),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
