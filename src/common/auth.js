// Description: JWT 인증 미들웨어 (토큰 블랙리스트 기능 포함)

// // src/common/auth.js (업데이트)
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const { createError } = require('./error');
//
// const prisma = new PrismaClient();
//
// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//
//     if (!token) {
//       return next(createError(401, '액세스 토큰이 필요합니다.'));
//     }
//
//     // 블랙리스트 확인
//     const blacklistedToken = await prisma.blacklistedToken.findUnique({
//       where: { token }
//     });
//
//     if (blacklistedToken) {
//       return next(createError(401, '유효하지 않은 토큰입니다.'));
//     }
//
//     jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         return next(createError(403, '토큰이 만료되었거나 유효하지 않습니다.'));
//       }
//
//       const user = await prisma.user.findUnique({
//         where: { id: decoded.userId },
//         select: { id: true, email: true, name: true }
//       });
//
//       if (!user) {
//         return next(createError(404, '사용자를 찾을 수 없습니다.'));
//       }
//
//       req.user = user;
//       next();
//     });
//   } catch (error) {
//     next(error);
//   }
// };
//
// module.exports = { authenticateToken };
