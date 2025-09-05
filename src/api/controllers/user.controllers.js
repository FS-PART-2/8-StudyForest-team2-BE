import { validationResult } from 'express-validator';
import {
  createUserService,
  loginUserService,
  rotateRefreshTokenService,
  logoutUserService,
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

  const { accessToken, refreshToken, refreshExpiresAt, user } =
    await loginUserService({ email, password, userAgent: ua, ip });

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: refreshExpiresAt,
    })
    .json({
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

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions()).json({
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
  });

  res.json({
    success: true,
    message: '로그아웃이 완료되었습니다.',
  });
}
//   // 프로필 조회
//   async getProfile(req, res, next) {
//     try {
//       const userId = req.user.id;
//       const user = await userService.getUserById(userId);
//
//       res.json({
//         success: true,
//         data: user,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// };
