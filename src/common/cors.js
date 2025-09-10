import cors from 'cors';
import dotenv from 'dotenv';

const envFile = '.env';
dotenv.config({ path: envFile });

const corsOptions = {
  origin: [
    'https://eight-studyforest-team2-be.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://mindmeld-fe.vercel.app',
    'https://8-study-forest-team2-fe-git-develop-seongeun95s-projects.vercel.app',
    'https://8-study-forest-team2-ccu0vb250-seongeun95s-projects.vercel.app',
  ], // 허용할 도메인
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type', 'Authorization', 'x-study-password'], // 허용할 헤더
  credentials: true, // 쿠키 인증을 사용함
  optionsSuccessStatus: 200, // 일부 브라우저 호환용
};

export default cors(corsOptions);
