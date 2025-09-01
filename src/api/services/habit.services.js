// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import argon2 from 'argon2';

const prisma = new PrismaClient();

/**
 * 오늘(KST) 00:00~24:00 범위(UTC 기준) 계산
 */
function getKSTDayRange(now = new Date()) {
  // KST = UTC+09, DST 없음
  const nowKst = new Date(now.getTime() + 9 * 3600000);
  const startKstUTC = Date.UTC(
    nowKst.getUTCFullYear(),
    nowKst.getUTCMonth(),
    nowKst.getUTCDate(),
    0,
    0,
    0,
    0,
  );
  const endKstUTC = startKstUTC + 24 * 3600000;
  const startUtc = new Date(startKstUTC - 9 * 3600000);
  const endUtc = new Date(endKstUTC - 9 * 3600000);

  const yyyy = String(nowKst.getUTCFullYear());
  const mm = String(nowKst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(nowKst.getUTCDate()).padStart(2, '0');
  const kstDateStr = `${yyyy}-${mm}-${dd}`;
  const hh = String(nowKst.getUTCHours()).padStart(2, '0');
  const mi = String(nowKst.getUTCMinutes()).padStart(2, '0');
  const ss = String(nowKst.getUTCSeconds()).padStart(2, '0');
  const nowKstIso = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+09:00`;
  return { startUtc, endUtc, nowKstIso, kstDateStr };
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
  const hash = study.password ?? '';
  try {
    if (typeof hash === 'string' && hash.startsWith('$argon2')) {
      ok = await argon2.verify(hash, password);
    } else if (typeof hash === 'string' && /^\$2[aby]\$/.test(hash)) {
      ok = await bcrypt.compare(password, hash);
    } else {
      // seed 등 평문 대비
      ok = password === hash;
    }
  } catch (_) {
    ok = false;
  }

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
      habitHistory: { is: { studyId } },
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
