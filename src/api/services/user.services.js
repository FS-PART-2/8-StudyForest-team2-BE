// Description: 사용자 관련 서비스 - 회원가입, 로그인, 로그아웃, 사용자 조회

// // src/api/services/user.services.js
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const { createError } = require('../../common/error.js');
//
// const prisma = new PrismaClient();
//
// const userService = {
//   // 사용자 생성
//   async createUser({ email, password, name }) {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       throw createError(409, '이미 존재하는 이메일입니다.');
//     }
//
//     const hashedPassword = await bcrypt.hash(password, 10);
//
//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         name,
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         createdAt: true,
//       },
//     });
//
//     return user;
//   },
//
//   // 사용자 로그인
//   async loginUser({ email, password }) {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       throw createError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
//     }
//
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       throw createError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
//     }
//
//     const token = jwt.sign(
//       { userId: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' },
//     );
//
//     return {
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//       },
//     };
//   },
//
//   // 사용자 로그아웃 (토큰 블랙리스트)
//   async logoutUser(token) {
//     if (token) {
//       await prisma.blacklistedToken.create({
//         data: { token },
//       });
//     }
//   },
//
//   // 사용자 조회
//   async getUserById(userId) {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });
//
//     if (!user) {
//       throw createError(404, '사용자를 찾을 수 없습니다.');
//     }
//
//     return user;
//   },
// };
//
// module.exports = userService;
