import cors from 'cors';
import 'dotenv/config';

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          process.env.PROD_FE_DOMAIN, // 프로덕션 도메인
          // 추가 허용 도메인들
        ].filter(Boolean) // undefined 제거
      : [process.env.DEV_FE_DOMAIN || 'http://localhost:3000'],

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 쿠키 인증을 사용함
  optionsSuccessStatus: 200, // 일부 브라우저 호환용
};

export default cors(corsOptions);
