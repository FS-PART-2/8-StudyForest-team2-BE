import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000', // 개발 서버 도메인
    '', // 배포한 프론트엔드 도메인 입력
  ],

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 쿠키 인증을 사용함
  optionsSuccessStatus: 200, // 일부 브라우저 호환용
};

export default cors(corsOptions);
