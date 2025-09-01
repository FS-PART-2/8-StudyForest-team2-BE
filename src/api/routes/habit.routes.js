// Description: API를 위한 라우터 설정 코드 파일입니다.
import express from 'express';
import coreMiddleware from '../../../src/common/cors.js';
import errorMiddleware from '../../../src/common/error.js'; // 에러를 추가할 일이 있다면, 해당 파일에 케이스를 추가해주시기 바랍니다.

const router = express.Router();

router.use(coreMiddleware); // CORS 미들웨어 적용

// 예시 API 엔드포인트
router.get(
  '/example-API',
  errorMiddleware.asyncHandler(async (req, res) => {
    res.json({ status: 'OK', message: 'This is example API' });
  }),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;
