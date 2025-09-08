// src/app.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';

import studyRoutes from './api/routes/study.routes.js';
import habitRoutes from './api/routes/habit.routes.js';
import userRoutes from './api/routes/user.routes.js';

import { swaggerDocs } from './common/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  if (!process.env.DATABASE_URL) {
    console.error('[ENV] DATABASE_URL 로드 실패');
  }
}

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(morgan('combined'));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('MindMeld API 연결 성공');
});

app.use('/api/studies', studyRoutes);
app.use('/api', habitRoutes);
app.use('/api/users', userRoutes);

// Swagger
swaggerDocs(app);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
