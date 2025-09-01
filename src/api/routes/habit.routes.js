// Description: 습관(Habit) 관련 API 라우터 설정 파일입니다.

// 라이브러리 정의
import express from 'express';
// 미들웨어 정의
import corsMiddleware from '../../common/cors';

// 컨트롤러 정의 (오늘의 습관 조회)
import { asyncHandler, errorHandler } from '../../common/error'; // 에러 케이스 추가는 여기서 관리
import { getTodayHabitsController } from '../controllers/habit.controllers';

const router = express.Router();

function validateStudyId(req, res, next) {
  const { studyId } = req.params;
  if (!/^\d+$/.test(String(studyId))) {
    return res.status(400).json({ message: 'Invalid studyId' });
  }
  return next();
}
router.use(corsMiddleware); // CORS 미들웨어 적용

// 오늘의 습관 조회 API
router.get(
  '/habits/today/:studyId',
  validateStudyId,
  asyncHandler(getTodayHabitsController),
);

// (필요 시 여기에 다른 habit 관련 엔드포인트를 추가)

// 에러 핸들링 미들웨어 (맨 마지막)
router.use(errorHandler);

export default router;
