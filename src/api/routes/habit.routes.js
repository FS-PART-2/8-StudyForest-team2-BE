// src/api/routes/habit.routes.js
// Description: 습관(Habit) 관련 API 라우터 설정 파일입니다.

import express from 'express';

// 미들웨어 (경로 하나만)
import corsMiddleware from '../../common/cors.js';
import { asyncHandler, errorHandler } from '../../common/error.js';

// 컨트롤러 (named export)
import { getTodayHabitsController } from '../controllers/habit.controllers.js';

const router = express.Router();

router.use(corsMiddleware);
router.use(express.json());

function validateStudyId(req, res, next) {
  const { studyId } = req.params;
  if (!/^\d+$/.test(String(studyId))) {
    return res.status(400).json({ message: 'Invalid studyId' });
  }
  return next();
}

// 예시 API (경로 분리)
router.get(
  '/example-API',
  asyncHandler(async (req, res) => {
    res.json({ status: 'OK', message: 'This is example API' });
  }),
);

// 오늘의 습관 조회 API (GET: 헤더 x-study-password / POST: 바디 password)
router.get(
  '/habits/today/:studyId',
  validateStudyId,
  asyncHandler(getTodayHabitsController),
);
router.post(
  '/habits/today/:studyId',
  validateStudyId,
  asyncHandler(getTodayHabitsController),
);

// 에러 핸들러 (맨 마지막)
router.use(errorHandler);

export default router;
