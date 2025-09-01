// Description: 습관(Habit) 관련 API 라우터 설정 파일입니다.

// 라이브러리 정의
import express from 'express';
<<<<<<< HEAD
import coreMiddleware from '../../../src/common/cors.js';
import errorMiddleware from '../../../src/common/error.js'; // 에러를 추가할 일이 있다면, 해당 파일에 케이스를 추가해주시기 바랍니다.

const router = express.Router();

router.use(coreMiddleware); // CORS 미들웨어 적용
=======

// 미들웨어 정의
import corsMiddleware from '../../common/cors.js';
import errorMiddleware from '../../common/error.js'; // 에러 케이스 추가는 여기서 관리

// 컨트롤러 정의 (오늘의 습관 조회)
import habitController from '../controllers/habit.controllers.js';

const router = express.Router();

router.use(corsMiddleware); // CORS 미들웨어 적용
router.use(express.json());
>>>>>>> 1cf3104 (feat: 오늘의 습관 API 작성)

// 오늘의 습관 조회 API
// GET /api/habits/today/:studyId?password=...
router.get(
  '/habits/today/:studyId',
  errorMiddleware.asyncHandler(habitController.getTodayHabitsController),
);

// (필요 시 여기에 다른 habit 관련 엔드포인트를 추가)

// 에러 핸들링 미들웨어 (맨 마지막)
router.use(errorMiddleware.errorHandler);

export default router;
