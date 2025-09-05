import argon2 from 'argon2';
import { validationResult } from 'express-validator';
import {
  createUserService,
  loginUserService,
  rotateRefreshTokenService,
  logoutUserService,
  getMyProfileService,
  updateMyProfileService,
} from '../services/user.services.js';

// 공용 쿠키 옵션 계산
function getRefreshCookieOptions() {
  const days = Number(process.env.REFRESH_EXPIRES_DAYS ?? 7);
  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}
// 회원가입
export async function registerController(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('입력 데이터가 유효하지 않습니다.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = result
      .array({ onlyFirstError: true })
      .map(({ msg, param, location }) => ({ msg, param, location }));
    throw err;
  }

  const { email, password, username, nick } = req.body;
  const user = await createUserService({ email, password, username, nick });
  res.status(201).location(`${req.baseUrl}/${user.id}`).json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: user,
  });
}
// 로그인
export async function loginController(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('입력 데이터가 유효하지 않습니다.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = result
      .array({ onlyFirstError: true })
      .map(({ msg, param, location }) => ({ msg, param, location }));
    throw err;
  }

  const { email, password } = req.body;
  const ua = req.get('User-Agent') || '';
  const ip = req.ip;
  const { accessToken, refreshToken, user } = await loginUserService({
    email,
    password,
    userAgent: ua,
    ip,
  });

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions()).json({
    success: true,
    message: '로그인이 완료되었습니다.',
    data: {
      accessToken,
      user,
    },
  });
}
// 액세스 토큰 재발급
export async function refreshTokenController(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    const err = new Error('리프레시 토큰이 필요합니다.');
    err.status = 401;
    err.code = 'NO_REFRESH_TOKEN';
    throw err;
  }

  const { accessToken, refreshToken, user } =
    await rotateRefreshTokenService(token);

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: refreshExpiresAt,
    })
    .json({
      success: true,
      message: '토큰이 재발급되었습니다.',
      data: { accessToken, user },
    });
}
// 로그아웃
export async function logoutController(req, res) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await logoutUserService(token);
  }

  // 쿠키 삭제
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: '로그아웃이 완료되었습니다.',
  });
}
// 내 프로필 조회
export async function getMeController(req, res) {
  // authenticateToken 미들웨어가 req.user(userId 등)를 채워준다고 가정
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    const err = new Error('인증이 필요합니다.');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const user = await getMyProfileService(userId);
  res.json({
    success: true,
    data: user,
  });
}

// 내 프로필 수정
export async function updateMeController(req, res) {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    const err = new Error('인증이 필요합니다.');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  // 검증 에러 처리(기존 패턴 유지)
  const { validationResult } = await import('express-validator');
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('입력 데이터가 유효하지 않습니다.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = result
      .array({ onlyFirstError: true })
      .map(({ msg, param, location }) => ({ msg, param, location }));
    throw err;
  }

  const {
    nick,
    username,
    email,
    currentPassword, // 비밀번호 변경 시 필요
    newPassword, // 비밀번호 변경 시 필요
  } = req.body;

  // 둘 다 있으면 비번 변경, 둘 다 없으면 비번 유지
  let newPasswordHash = undefined;
  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    const err = new Error(
      '비밀번호 변경 시 currentPassword와 newPassword가 모두 필요합니다.',
    );
    err.status = 400;
    err.code = 'PASSWORD_CHANGE_BAD_REQUEST';
    throw err;
  }
  if (currentPassword && newPassword) {
    // 서비스에서 현재 비밀번호 검증도 하지만, 여기서도 간단 체크 가능
    // 본 검증은 서비스에서 최종 수행
    newPasswordHash = await argon2.hash(newPassword);
  }

  const updated = await updateMyProfileService(userId, {
    nick,
    username,
    email,
    currentPassword,
    newPasswordHash,
  });

  res.json({
    success: true,
    message: '프로필이 업데이트되었습니다.',
    data: updated,
  });
}
