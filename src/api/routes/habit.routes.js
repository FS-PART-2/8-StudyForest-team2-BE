// Description: 습관(Habit) 관련 API 라우터 설정 파일입니다.

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

// 라이브러리 정의
import express from 'express';
import corsMiddleware from '../../common/cors.js';

// 컨트롤러
import errorMiddleware from '../../common/error.js'; // 에러 케이스 추가는 여기서 관리
import {
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
} from '../controllers/habit.controllers.js';

const router = express.Router();

router.use(corsMiddleware); // CORS 미들웨어 적용

// 오늘의 습관 조회
router.get(
  '/habits/today/:studyId',
  errorMiddleware.asyncHandler(getTodayHabitsController),
);

// 오늘의 습관 생성
router.post(
  '/habits/today/:studyId',
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

// 에러 핸들링 미들웨어 (맨 마지막)
router.use(errorMiddleware.errorHandler);

export default router;
