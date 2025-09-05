// src/api/services/user.services.js
import { PrismaClient, Prisma } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

const {
  JWT_SECRET,
  ACCESS_EXPIRES_IN = '1h', // 환경변수로 조정 가능
} = process.env;

if (!JWT_SECRET) {
  throw Object.assign(new Error('JWT_SECRET is required'), {
    status: 500,
    code: 'MISSING_JWT_SECRET',
  });
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function makeRefreshToken() {
  // 고엔트로피 랜덤 문자열(문자열 기반 RT 정책)
  return crypto.randomBytes(48).toString('hex');
}

export async function createUserService({ email, password, username, nick }) {
  // 중복 체크
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

export async function loginUserService({
  email,
  password /* userAgent, ip */,
}) {
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

  // 1유저-1토큰 정책: 덮어쓰기
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
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
    where: { refreshToken: oldRefreshToken },
  });
  if (!user) {
    const err = new Error('유효하지 않은 리프레시 토큰입니다.');
    err.status = 401;
    err.code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const newRefreshToken = makeRefreshToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
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
  await prisma.user.updateMany({
    where: { refreshToken },
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

  // 비번 변경 요청 시 현재 비번 검증
  if (currentPassword && newPasswordHash) {
    const ok = await argon2.verify(user.password, currentPassword);
    if (!ok) {
      const err = new Error('현재 비밀번호가 올바르지 않습니다.');
      err.status = 400;
      err.code = 'CURRENT_PASSWORD_INVALID';
      throw err;
    }
  }

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
