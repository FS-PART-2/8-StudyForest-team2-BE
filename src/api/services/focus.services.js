import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function serviceUpdateFocus(point, studyId) {
  const updateResult = await prisma.point.updateMany({
    where: { studyId: Number(studyId) },
    data: { point: { increment: point } },
  });

  if (updateResult.count === 0) {
    const error = new Error(
      `studyId ${studyId}에 해당하는 포인트 기록이 없습니다.`,
    );
    error.status = 404;
    throw error;
  }

  return prisma.point.findFirst({
    where: { studyId: Number(studyId) },
    select: { point: true },
  });
}

export default {
  serviceUpdateFocus,
};
