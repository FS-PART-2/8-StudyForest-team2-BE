// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 오늘(KST) 00:00~24:00 범위(UTC 기준) 계산
 */
function getKSTDayRange(now = new Date()) {
  const kstNow = new Date(
    new Date(now).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }),
  );

  const startKst = new Date(kstNow);
  startKst.setHours(0, 0, 0, 0);

  const endKst = new Date(startKst);
  endKst.setDate(endKst.getDate() + 1);

  // KST → UTC 변환 (−9시간)
  const startUtc = new Date(startKst.getTime() - 9 * 3600000);
  const endUtc = new Date(endKst.getTime() - 9 * 3600000);

  // YYYY-MM-DD (KST)
  const yyyy = startKst.getFullYear();
  const mm = String(startKst.getMonth() + 1).padStart(2, '0');
  const dd = String(startKst.getDate()).padStart(2, '0');
  const kstDateStr = `${yyyy}-${mm}-${dd}`;

  return { startUtc, endUtc, nowKstIso: kstNow.toISOString(), kstDateStr };
}

export default async function getTodayHabitsService({ studyId, password }) {
  // 1) 스터디 확인
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, name: true, password: true, isActive: true },
  });
  if (!study) {
    const e = new Error('해당 스터디가 존재하지 않습니다.');
    e.name = 'NotFoundError';
    throw e;
  }

  // 2) 비밀번호 검증
  if (!password || !study.password) {
    const e = new Error('비밀번호가 필요합니다.');
    e.name = 'UnauthorizedError';
    throw e;
  }

  let ok = false;
  try {
    ok = await bcrypt.compare(password, study.password);
  } catch (err) {
    ok = false;
  }

  // 개발 초기에 해시 저장이 안 됐다면 평문 비교도 허용
  if (!ok && password === study.password) ok = true;

  if (!ok) {
    const e = new Error('비밀번호가 일치하지 않습니다.');
    e.name = 'UnauthorizedError';
    throw e;
  }

  // 3) 오늘 범위 계산
  const { startUtc, endUtc, nowKstIso, kstDateStr } = getKSTDayRange();

  // 4) 오늘의 Habit 조회
  const habits = await prisma.habit.findMany({
    where: {
      date: { gte: startUtc, lt: endUtc },
      habitHistory: { studyId },
    },
    select: {
      id: true,
      habit: true,
      isDone: true,
      date: true,
      habitHistoryId: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return {
    study: { id: study.id, name: study.name, isActive: study.isActive },
    now: nowKstIso,
    date: kstDateStr,
    habits: habits.map(h => ({
      habitId: h.id,
      title: h.habit,
      isDone: h.isDone,
      date: h.date,
      habitHistoryId: h.habitHistoryId,
    })),
    links: {
      focusToday: `/studies/${studyId}/focus-today`,
      home: `/studies/${studyId}`,
    },
  };
}
