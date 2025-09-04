import { PrismaClient, Prisma } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const prisma = new PrismaClient();

// 필수: JWT_SECRET 미설정 시 즉시 실패
const {
  JWT_SECRET,
  ACCESS_EXPIRES_IN = '1h',
  REFRESH_EXPIRES_DAYS: REFRESH_EXPIRES_DAYS_RAW = '7',
} = process.env;
if (!JWT_SECRET) {
  throw Object.assign(new Error('JWT_SECRET is required'), {
    status: 500,
    code: 'MISSING_JWT_SECRET',
  });
}
const REFRESH_EXPIRES_DAYS = Number(REFRESH_EXPIRES_DAYS_RAW);
if (!Number.isFinite(REFRESH_EXPIRES_DAYS) || REFRESH_EXPIRES_DAYS <= 0) {
  throw Object.assign(
    new Error('REFRESH_EXPIRES_DAYS must be a positive number'),
    { status: 500, code: 'INVALID_REFRESH_EXPIRES' },
  );
}
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

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, username, nick },
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
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      const target = Array.isArray(e.meta?.target)
        ? e.meta.target.join(',')
        : String(e.meta?.target ?? '');
      if (target.includes('email')) {
        const err = new Error('이미 사용 중인 이메일입니다.');
        err.status = 409;
        err.code = 'DUPLICATE_EMAIL';
        throw err;
      }
      if (target.includes('username')) {
        const err = new Error('이미 사용 중인 사용자명(username)입니다.');
        err.status = 409;
        err.code = 'DUPLICATE_USERNAME';
        throw err;
      }
    }
    throw e;
  }
}
function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function makeRefreshToken() {
  // 임의의 고Entropy 토큰(순수 문자열). 필요 시 JWT로 바꿔도 OK.
  return crypto.randomBytes(48).toString('hex');
}

export async function loginUserService({ email, password, userAgent, ip }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const ok = await argon2.verify(user.password, password);
  if (!ok) {
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  // 액세스 토큰
  const accessToken = signAccessToken({ userId: user.id, email: user.email });

  // 리프레시 토큰(문자열) 발급 + DB 저장(유니크 컬럼)
  const refreshToken = makeRefreshToken();

  // 기존 토큰 한 개 정책: 유저당 1개만 유지하고 싶다면 refreshToken을 덮어쓰기
  // 여러 기기 허용 정책이면 UserRefreshToken 테이블로 확장 권장
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
    select: { id: true },
  });

  const refreshExpiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  return {
    accessToken,
    refreshToken,
    refreshExpiresAt,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      nick: user.nick,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function rotateRefreshTokenService(oldRefreshToken) {
  if (!oldRefreshToken) {
    const err = new Error('리프레시 토큰이 필요합니다.');
    err.status = 401;
    err.code = 'NO_REFRESH_TOKEN';
    throw err;
  }

  const user = await prisma.user.findFirst({
    where: { refreshToken: oldRefreshToken },
  });
  if (!user) {
    const err = new Error('유효하지 않은 리프레시 토큰입니다.');
    err.status = 401;
    err.code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }

  // 새 액세스/리프레시 발급
  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const newRefreshToken = makeRefreshToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
    select: { id: true },
  });

  const refreshExpiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    refreshExpiresAt,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      nick: user.nick,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function logoutUserService(refreshToken) {
  if (!refreshToken) return;
  // 해당 토큰을 가진 유저만 로그아웃 처리(덮어쓰기)
  await prisma.user.updateMany({
    where: { refreshToken },
    data: { refreshToken: null },
  });
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
