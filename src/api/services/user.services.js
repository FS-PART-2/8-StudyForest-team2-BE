import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

export async function createUserService({ email, password, username, nick }) {
  // 중복 이메일/username 체크
  const [emailExists, usernameExists] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  if (emailExists) {
    const err = new Error('이미 사용 중인 이메일입니다.');
    err.status = 409;
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  if (usernameExists) {
    const err = new Error('이미 사용 중인 사용자명(username)입니다.');
    err.status = 409;
    err.code = 'DUPLICATE_USERNAME';
    throw err;
  }

  const hashed = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      username,
      nick,
    },
    select: {
      id: true,
      email: true,
      username: true,
      nick: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
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
