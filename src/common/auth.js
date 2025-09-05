// src/common/auth.js
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  try {
    // 헤더는 소문자 key로 normalize됨
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      const err = new Error('액세스 토큰이 필요합니다.');
      err.status = 401;
      err.code = 'NO_ACCESS_TOKEN';
      throw err;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const e = new Error('토큰이 만료되었거나 유효하지 않습니다.');
        e.status = 403;
        e.code = 'INVALID_TOKEN';
        throw e;
      }
      // 로그인 시 { userId, email } 넣었으니 그대로 사용
      req.user = { userId: decoded.userId, email: decoded.email };
      next();
    });
  } catch (e) {
    next(e);
  }
}
