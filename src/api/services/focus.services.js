import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function serviceUpdateFocus(point, studyId) {
  const numericStudyId = Number(studyId);
  const numericPoint = Number(point);

  // 포인트 값 유효성 검사
  if (!Number.isFinite(numericPoint) || numericPoint < 0) {
    const err = new Error('point 값은 0 이상의 숫자여야 합니다.');
    err.status = 400;
    err.code = 'INVALID_POINT';
    throw err;
  }

  // 1) 포인트 이벤트 1건 추가
  // 2) 총합 집계  (트랜잭션으로 원자성 보장)
  const [, agg] = await prisma.$transaction([
    prisma.point.create({
      data: { studyId: numericStudyId, point: numericPoint },
      select: { id: true },
    }),
    prisma.point.aggregate({
      where: { studyId: numericStudyId },
      _sum: { point: true },
    }),
  ]);

  // 갱신된 누적 포인트 반환
  // eslint-disable-next-line no-underscore-dangle
  return { point: agg._sum.point };
}

export default {
  serviceUpdateFocus,
};
