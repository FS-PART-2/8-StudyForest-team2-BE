import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function serviceGetList(studyId) {
  const focusList = await prisma.focus.findMany({
    where: { studyId },
    select: {
      id: true,
      setTime: true,
    },
  });

  if (focusList.length === 0) {
    return [];
  }

  return focusList;
}

async function serviceUpdateFocus(studyId, minuteData, secondData) {
  // ms 변환 헬퍼
  const toMs = (minutes = 0, seconds = 0) => (minutes * 60 + seconds) * 1000;

  // 의도: 오늘 행을 찾아 setTime = setTime + time (DateTime)
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const today1 = new Date();
  today1.setHours(23, 59, 59, 999);

  // 1) 오늘 행 찾기 (가장 최근 1건 가정)
  const current = await prisma.focus.findFirst({
    where: { studyId, setTime: { gte: today0, lte: today1 } },
    orderBy: { id: 'desc' },
  });

  const now = new Date();
  if (!current) {
    // 오늘 행이 없으면 새로 생성
    const created = await prisma.focus.create({
      data: {
        studyId,
        setTime: new Date(now.getTime() + toMs(minuteData, secondData)), // 초기값을 “현재+delta”로
        createdAt: now,
        updatedAt: now,
      },
    });
    return created;
  }

  // 2) 존재하면 Date 계산 후 대체 업데이트
  const newSetTime = new Date(now.getTime() + toMs(minuteData, secondData));
  const updated = await prisma.focus.update({
    where: { id: current.id }, // ✅ focus PK로 갱신
    data: { setTime: newSetTime, updatedAt: now },
  });
  return updated;
}

export default {
  serviceGetList,
  serviceUpdateFocus,
};
