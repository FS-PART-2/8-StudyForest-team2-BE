// Express, Prisma, JWT 등의 에러 처리는 이곳에서 할 수 있도록 수정해 주세요.
import { Prisma } from '@prisma/client';

function asyncHandler(handler) {
  async function asyncReqHandler(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (err) {
      // 에러를 중앙 에러 처리기로 전달
      next(err);
    }
  }
  return asyncReqHandler;
}

function errorHandler(err, req, res, next) {
  // 이곳에서 공통 에러를 처리해주세요
  // Prisma Client 에러 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // 문서: https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-known-request-error
    switch (err.code) {
      case 'P2002': {
        // Unique 제약 위반
        err.status = 409;
        err.code = 'DUPLICATE_KEY';
        const fields = err.meta?.target || [];
        err.message = 'Unique constraint violated';
        err.details = { fields };
        break;
      }
      case 'P2003': {
        // FK 제약 위반
        err.status = 409;
        err.code = 'FOREIGN_KEY_CONSTRAINT';
        err.message = 'Foreign key constraint failed';
        err.details = {
          field: err.meta?.field_name || err.meta?.field || undefined,
        };
        break;
      }
      case 'P2025': {
        // 요구 레코드 미존재 (update/delete where not found 등)
        err.status = 404;
        err.code = 'RECORD_NOT_FOUND';
        err.message = 'Record not found';
        err.details = { cause: err.meta?.cause };
        break;
      }
      case 'P2000': {
        // 값이 컬럼 길이를 초과
        err.status = 400;
        err.code = 'VALUE_TOO_LONG';
        err.message = 'Provided value is too long for the column';
        err.details = { column: err.meta?.column_name };
        break;
      }
      case 'P2001': {
        // where 조건에 부합하는 레코드 없음
        err.status = 404;
        err.code = 'RECORD_NOT_FOUND';
        err.message = 'Record not found for the given where condition';
        break;
      }
      case 'P2014': {
        // 잘못된 관계 사용
        err.status = 400;
        err.code = 'INVALID_RELATION';
        err.message = 'Invalid relation usage';
        break;
      }
      default: {
        // 기타 Prisma Known 에러
        err.status = 400;
        err.code = `PRISMA_${err.code}`;
        err.message = 'Database request error';
        err.details = err.meta ?? undefined;
      }
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    // 스키마/입력값 검증 오류 (쿼리 시 타입/필드 불일치 등)
    err.status = 400;
    err.code = 'PRISMA_VALIDATION_ERROR';
    err.message = 'Invalid input for database operation';
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    // DB 연결/초기화 실패
    err.status = 500;
    err.code = 'PRISMA_INIT_ERROR';
    err.message = 'Database initialization error';
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    // 드물지만 드라이버 패닉
    err.status = 500;
    err.code = 'PRISMA_RUST_PANIC';
    err.message = 'Database engine panic';
  }

  // JWT 에러 처리
  else if (err.name === 'JsonWebTokenError') {
    err.status = 401;
    err.code = 'INVALID_TOKEN';
    err.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    err.status = 401;
    err.code = 'TOKEN_EXPIRED';
    err.message = 'Token has expired';
  }

  // JSON Parse 에러
  else if (err instanceof SyntaxError && 'body' in err) {
    err.status = 400;
    err.code = 'INVALID_JSON';
    err.message = 'Malformed JSON in request body';
  }

  // Multer 업로드 에러
  else if (err.name === 'MulterError') {
    err.status = 400;
    err.code = 'UPLOAD_ERROR';
    err.message = err.message;
  }

  // 응답 전송
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || undefined,
    },
  });
}

export default { asyncHandler, errorHandler };
