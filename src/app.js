// // src/app.js (라우트 추가)
// const userRoutes = require('./api/routes/user.routes');
//
// // 라우트 등록
// app.use('/api/users', userRoutes);

// 환경 변수 관련 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import express from 'express';
import morgan from 'morgan';
import studyRoutes from '../src/api/routes/study.routes.js';

// 환경 변수 설정
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  if (!process.env.DATABASE_URL) {
    console.error('[ENV] DATABASE_URL 로드 실패');
  }
}


const app = express();

app.use(express.json()); // JSON 파싱 미들웨어 추가
app.use(morgan('combined'));
app.use('/study', studyRoutes);

app.listen(3000, () => {
  console.log('Test server is running on port 3000');
});
