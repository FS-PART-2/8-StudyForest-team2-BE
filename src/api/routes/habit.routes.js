/**
 * @swagger
 * tags:
 *   name: Habits
 *   description: '습관(Habit) 관련 API'
 *
 * components:
 *   schemas:
 *     HabitTodayItem:
 *       type: object
 *       properties:
 *         habitId:
 *           type: integer
 *           example: 12
 *         title:
 *           type: string
 *           example: '코딩 2시간'
 *         isDone:
 *           type: boolean
 *           example: false
 *         date:
 *           type: string
 *           format: date-time
 *           example: '2025-09-02T00:10:00.000Z'
 *         habitHistoryId:
 *           type: integer
 *           example: 7
 *
 *     HabitTodayResponse:
 *       type: object
 *       properties:
 *         study:
 *           type: object
 *           properties:
 *             id: { type: integer, example: 101 }
 *             name: { type: string, example: 'ROS2 보안 연구' }
 *             isActive: { type: boolean, example: true }
 *         now:
 *           type: string
 *           description: 'KST 현재 시각 ISO 문자열(+09:00)'
 *           example: '2025-09-02T11:23:45+09:00'
 *         date:
 *           type: string
 *           description: 'KST 기준 YYYY-MM-DD'
 *           example: '2025-09-02'
 *         habits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HabitTodayItem'
 *         links:
 *           type: object
 *           properties:
 *             focusToday: { type: string, example: '/studies/101/focus-today' }
 *             home: { type: string, example: '/studies/101' }
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: '비밀번호가 필요합니다.'
 *
 *   parameters:
 *     StudyIdParam:
 *       name: studyId
 *       in: path
 *       required: true
 *       schema: { type: integer }
 *       description: '스터디 ID'
 *
 *   securitySchemes:
 *     studyPassword:
 *       type: apiKey
 *       in: header
 *       name: X-study-password
 *       description: '스터디 비밀번호(평문 또는 해시 검증용 입력)'
 *
 */

/**
 * @swagger
 * /api/habits/today/{studyId}:
 *   get:
 *     tags:
 *       - Habits
 *     summary: 오늘의 습관 목록 조회 (KST 00:00–24:00)
 *     description: 해당 스터디에 대해 KST 기준 오늘 날짜의 습관 목록을 반환합니다. 인증을 위해 스터디 비밀번호가 필요합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     security:
 *       - studyPassword: []
 *     responses:
 *       '200':
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HabitTodayResponse'
 *       '400':
 *         description: 잘못된 요청(유효하지 않은 studyId 또는 비밀번호 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 비밀번호 누락 또는 불일치
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 스터디가 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/habits/today/{studyId}/bulk:
 *   post:
 *     tags: [Habits]
 *     summary: 오늘의 습관 일괄 생성
 *     description: 문자열 배열을 오늘(KST 00:00) 날짜로 일괄 생성합니다. 이미 존재하는 항목은 스킵됩니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     security:
 *       - studyPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habits:
 *                 type: array
 *                 items: { type: string }
 *                 example: ['물 1리터 마시기', '운동 30분', '회고 쓰기']
 *     responses:
 *       '201':
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 study:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 101 }
 *                     name: { type: string, example: 'ROS2 보안 연구' }
 *                     isActive: { type: boolean, example: true }
 *                 now:  { type: string, example: '2025-09-02T11:23:45+09:00' }
 *                 date: { type: string, example: '2025-09-02' }
 *                 createdCount: { type: integer, example: 2 }
 *                 habits:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HabitTodayItem'
 *       '400': { description: 잘못된 요청, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 스터디 없음, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 */

/**
 * @swagger
 * /api/habits/today/{studyId}:
 *   post:
 *     tags: [Habits]
 *     summary: 오늘의 습관 단일 추가
 *     description: 제목 하나를 오늘(KST 00:00) 날짜로 생성합니다. 같은 제목이 오늘 이미 있으면 409를 반환합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     security:
 *       - studyPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: '단어 50개'
 *     responses:
 *       '201':
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created:
 *                   $ref: '#/components/schemas/HabitTodayItem'
 *       '400': { description: 잘못된 요청, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 스터디 없음, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '409': { description: 중복 제목,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 */

/**
 * @swagger
 * /api/habits/{habitId}/toggle:
 *   patch:
 *     tags: [Habits]
 *     summary: 오늘의 습관 체크/해제
 *     description: 해당 habitId의 완료 여부를 토글합니다. (정책상 오늘 기록만 토글 허용)
 *     parameters:
 *       - name: habitId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - studyPassword: []
 *     responses:
 *       '200':
 *         description: 토글 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 habitId:        { type: integer, example: 12 }
 *                 isDone:         { type: boolean, example: true }
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: '2025-09-02T00:00:00.000Z'
 *                 habitHistoryId: { type: integer, example: 7 }
 *       '400': { description: 잘못된 요청, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 습관 없음,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 */

/**
 * @swagger
 * /api/habits/week/{studyId}:
 *   get:
 *     tags: [Habits]
 *     summary: 주간 습관 기록 조회
 *     description: KST 기준으로 월~일 주간 범위를 계산하여 습관 기록표를 반환합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *       - name: date
 *         in: query
 *         required: false
 *         schema: { type: string, example: '2025-09-02' }
 *         description: 기준 날짜(YYYY-MM-DD). 미지정 시 오늘이 포함된 주.
 *     security:
 *       - studyPassword: []
 *     responses:
 *       '200':
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 study:
 *                   type: object
 *                   properties:
 *                     id:       { type: integer, example: 101 }
 *                     name:     { type: string,  example: 'ROS2 보안 연구' }
 *                     isActive: { type: boolean, example: true }
 *                 week:
 *                   type: object
 *                   properties:
 *                     start:    { type: string, example: '2025-09-01' }
 *                     end:      { type: string, example: '2025-09-07' }
 *                     weekDate:
 *                       type: string
 *                       format: date-time
 *                       description: '@db.Date 저장 기준'
 *                     summary:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         monDone: { type: boolean }
 *                         tueDone: { type: boolean }
 *                         wedDone: { type: boolean }
 *                         thuDone: { type: boolean }
 *                         friDone: { type: boolean }
 *                         satDone: { type: boolean }
 *                         sunDone: { type: boolean }
 *                 days:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         habitId: { type: integer, example: 12 }
 *                         title:   { type: string,  example: '운동 30분' }
 *                         isDone:  { type: boolean, example: false }
 *       '400': { description: 잘못된 요청, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 스터디 없음, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,   content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 */

/**
 * @swagger
 * /api/habits/today/{studyId}/{habitId}:
 *   patch:
 *     tags: [Habits]
 *     summary: 오늘의 습관 이름 변경 (과거 전체 반영)
 *     description: 기준 습관과 동일 제목의 과거~오늘 레코드를 모두 새 제목으로 변경합니다. 동일 기간에 새 제목이 이미 존재하면 409를 반환합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *       - name: habitId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - studyPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: '단어 100개'
 *     responses:
 *       '200':
 *         description: 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated: { type: integer, example: 4 }
 *                 newTitle: { type: string,  example: '단어 100개' }
 *       '400': { description: 잘못된 요청,     content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,       content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 습관/스터디 없음, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '409': { description: 새 제목 중복 충돌, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,       content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *
 *   delete:
 *     tags: [Habits]
 *     summary: 오늘부터 습관 종료 (과거 기록 보존)
 *     description: 같은 제목의 오늘 이후(오늘 포함) 기록만 삭제합니다. 과거 기록은 유지됩니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *       - name: habitId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - studyPassword: []
 *     responses:
 *       '200':
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted: { type: integer, example: 2 }
 *       '400': { description: 잘못된 요청,     content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '401': { description: 인증 실패,       content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '404': { description: 습관/스터디 없음, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       '500': { description: 서버 오류,       content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 */

// Description: 습관(Habit) 관련 API 라우터 설정 파일입니다.

import express from 'express';
import corsMiddleware from '../../common/cors.js';

// 컨트롤러
import errorMiddleware from '../../common/error.js'; // 에러 케이스 추가는 여기서 관리
import {
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
  renameTodayHabitController,
  deleteTodayHabitController,
  addTodayHabitController,
  setWeekHabitsController
} from '../controllers/habit.controllers.js';

const router = express.Router();

router.use(corsMiddleware); // CORS 미들웨어 적용

// 오늘의 습관 조회
router.get(
  '/habits/today/:studyId',
  errorMiddleware.asyncHandler(getTodayHabitsController),
);

// 습관 일괄 생성
router.post(
  '/habits/today/:studyId/bulk',
  errorMiddleware.asyncHandler(createTodayHabitsController),
);

// 오늘의 습관 체크/해제 (토글)
router.patch(
  '/habits/:habitId/toggle',
  errorMiddleware.asyncHandler(toggleHabitController),
);

// 주간 습관 기록 조회 (?date=YYYY-MM-DD)
router.get(
  '/habits/week/:studyId',
  errorMiddleware.asyncHandler(getWeekHabitsController),
);
// 오늘의 습관 이름 변경(오늘 포함 과거 전체에 반영)
router.patch(
  '/habits/today/:studyId/:habitId',
  errorMiddleware.asyncHandler(renameTodayHabitController),
);

// 오늘부터 습관 종료(삭제) — 과거 기록 보존
router.delete(
  '/habits/today/:studyId/:habitId',
  errorMiddleware.asyncHandler(deleteTodayHabitController),
);

// 오늘부터 새로운 습관 추가 — 과거엔 표시 X
router.post(
  '/habits/today/:studyId',
  errorMiddleware.asyncHandler(addTodayHabitController),
);

// 습관 기록표 API 엔드포인트
router.post(
  '/:studyId/habit-history',
  errorMiddleware.asyncHandler(setWeekHabitsController),
);

// 에러 핸들링 미들웨어 (맨 마지막)
router.use(errorMiddleware.errorHandler);

export default router;
