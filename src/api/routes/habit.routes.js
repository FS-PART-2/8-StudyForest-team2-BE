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
