// // src/app.js (라우트 추가)
// const userRoutes = require('./api/routes/user.routes');
//
// // 라우트 등록
// app.use('/api/users', userRoutes);
import express from 'express';
import studyRoutes from '../src/api/routes/study.routes.js';

const app = express();

app.use('/api/study', studyRoutes);

app.listen(3000, () => {
  console.log('Test server is running on port 3000');
});
