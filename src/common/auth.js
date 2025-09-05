// src/common/auth.js
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(
      Object.assign(new Error('액세스 토큰이 필요합니다.'), {
        status: 401,
        code: 'NO_ACCESS_TOKEN',
      }),
    );
  }

  try {
    // 시계 오차 대비 몇 초 허용
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 5,
    });
    req.user = { userId: decoded.userId, email: decoded.email };
    return next();
  } catch (err) {
    return next(
      Object.assign(new Error('토큰이 만료되었거나 유효하지 않습니다.'), {
        status: 403,
        code: 'INVALID_TOKEN',
      }),
    );
  }
}
