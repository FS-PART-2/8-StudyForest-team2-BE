// Description: API를 위한 라우터 설정 코드 파일입니다.
import express from 'express';
import coreMiddleware from '../../common/cors.js';
import errorMiddleware from '../../common/error.js';

import focusControllers from '../controllers/focus.controllers.js';

const router = express.Router();

router.use(coreMiddleware); // CORS 미들웨어 적용

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
