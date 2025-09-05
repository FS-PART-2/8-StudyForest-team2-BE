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

// 리프레시 토큰의 비가역 지문(SHA-256 hex)
// DB에는 이 digest만 저장/조회해서 평문 노출 위험을 줄임
function rtDigest(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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

  // 리프레시 토큰(평문) + digest
  const refreshToken = makeRefreshToken();
  const refreshTokenDigest = rtDigest(refreshToken);

  // 기존 토큰 한 개 정책: 유저당 1개만 유지하고 싶다면 refreshToken을 덮어쓰기
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshTokenDigest },
    select: { id: true },
  });

  return {
    accessToken,
    refreshToken,
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
    where: { refreshToken: rtDigest(oldRefreshToken) },
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
  const newRefreshTokenDigest = rtDigest(newRefreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshTokenDigest },
    select: { id: true },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
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
    where: { refreshToken: rtDigest(refreshToken) },
    data: { refreshToken: null },
  });
}
export async function getMyProfileService(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      nick: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  return user;
}

export async function updateMyProfileService(
  userId,
  { nick, username, email, currentPassword, newPasswordHash },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });
  if (!user) {
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  // 비밀번호 변경 요청 시 현재 비밀번호 검증
  if (currentPassword && newPasswordHash) {
    const ok = await argon2.verify(user.password, currentPassword);
    if (!ok) {
      const err = new Error('현재 비밀번호가 올바르지 않습니다.');
      err.status = 400;
      err.code = 'CURRENT_PASSWORD_INVALID';
      throw err;
    }
  }
  if (newPasswordHash && !currentPassword) {
    const err = new Error(
      '비밀번호 변경 시 currentPassword와 newPassword가 모두 필요합니다.',
    );
    err.status = 400;
    err.code = 'PASSWORD_CHANGE_BAD_REQUEST';
    throw err;
  }
  if (currentPassword && !newPasswordHash) {
    const err = new Error(
      '비밀번호 변경 시 currentPassword와 newPassword가 모두 필요합니다.',
    );
    err.status = 400;
    err.code = 'PASSWORD_CHANGE_BAD_REQUEST';
    throw err;
  }

  // 업데이트 payload 구성
  const data = {};
  if (typeof nick === 'string') data.nick = nick;
  if (typeof username === 'string') data.username = username;
  if (typeof email === 'string') data.email = email;
  if (newPasswordHash) data.password = newPasswordHash;

  if (Object.keys(data).length === 0) {
    const err = new Error('변경할 필드가 없습니다.');
    err.status = 400;
    err.code = 'NO_FIELDS_TO_UPDATE';
    throw err;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        nick: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  } catch (e) {
    // 고유 제약 위반 처리
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
