// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)

import { PrismaClient } from '@prisma/client';
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

/**
 * 주 시작일(월요일 00:00 KST)의 UTC Date 반환 + 주 끝(일요일 24:00 직전)
 */
function getKSTWeekRange(dateInput) {
  const base = dateInput ? new Date(dateInput) : new Date();
  const baseKst = new Date(base.getTime() + 9 * 3600000);

  const day = baseKst.getUTCDay();

  const diffToMon = (day + 6) % 7;
  const monKstUTC = Date.UTC(
    baseKst.getUTCFullYear(),
    baseKst.getUTCMonth(),
    baseKst.getUTCDate() - diffToMon,
    0,
    0,
    0,
    0,
  );
  const monUtc = new Date(monKstUTC - 9 * 3600000);
  const sunUtcEnd = new Date(monUtc.getTime() + 7 * 24 * 3600000);
  const weekDateOnly = new Date(monUtc); // HabitHistory.weekDate용(날짜 컬럼이면 날짜만 사용)

  const yyyy = String(baseKst.getUTCFullYear());
  const mm = String(baseKst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(baseKst.getUTCDate()).padStart(2, '0');
  const kstDateStr = `${yyyy}-${mm}-${dd}`;

  return {
    weekStartUtc: monUtc, // 포함
    weekEndUtc: sunUtcEnd, // 미포함
    weekDateOnly, // HabitHistory.weekDate용
    kstDateStr, // 요청 기준 일자(문자열)
  };
}

/* 스터디 + 비밀번호 검증 (argon2/평문 seed 지원) */
async function assertStudyWithPassword({ studyId, password }) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, name: true, password: true, isActive: true },
  });
  if (!study) {
    const e = new Error('해당 스터디가 존재하지 않습니다.');
    e.name = 'NotFoundError';
    throw e;
  }
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
    } else {
      // seed 등 평문 대비
      ok = password === hash;
    }
  } catch {
    ok = false;
  }

  if (!ok) {
    const e = new Error('비밀번호가 일치하지 않습니다.');
    e.name = 'UnauthorizedError';
    throw e;
  }

  return study;
}

/* GET 오늘의 습관 조회 */
export default async function getTodayHabitsService({ studyId, password }) {
  // 1) 인증
  const study = await assertStudyWithPassword({ studyId, password });

  // 2) 오늘 범위 계산
  const { startUtc, endUtc, nowKstIso, kstDateStr } = getKSTDayRange();

  // 3) 오늘 습관 조회
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

/* POST 오늘의 습관 생성 */
export async function createTodayHabitsService({ studyId, password, titles }) {
  const study = await assertStudyWithPassword({ studyId, password });

  const { startUtc, endUtc, nowKstIso, kstDateStr } = getKSTDayRange();
  const { weekStartUtc, weekDateOnly } = getKSTWeekRange(startUtc);

  // 1) 해당 주 HabitHistory upsert
  const hh = await prisma.habitHistory.upsert({
    where: { studyId_weekDate: { studyId, weekDate: weekDateOnly } },
    update: {},
    create: {
      studyId,
      weekDate: weekDateOnly,
    },
    select: { id: true },
  });

  // 2) 오늘 날짜에 대해 타이틀들 생성 (중복은 unique 제약으로 스킵)
  const dataToCreate = titles.map(title => ({
    habit: title.trim(),
    date: startUtc, // 00:00 UTC 환산 기준(오늘)
    isDone: false,
    habitHistoryId: hh.id,
  }));

  // createMany는 unique 충돌 시 skipDuplicates 사용
  const createRes = await prisma.habit.createMany({
    data: dataToCreate,
    skipDuplicates: true,
  });

  // 3) 오늘 생성/전체 목록 반환
  const habits = await prisma.habit.findMany({
    where: {
      date: { gte: startUtc, lt: endUtc },
      habitHistoryId: hh.id,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return {
    study: { id: study.id, name: study.name, isActive: study.isActive },
    now: nowKstIso,
    date: kstDateStr,
    createdCount: createRes.count,
    habits: habits.map(h => ({
      habitId: h.id,
      title: h.habit,
      isDone: h.isDone,
      date: h.date,
      habitHistoryId: h.habitHistoryId,
    })),
  };
}

/* PATCH 오늘의 습관 체크/해제 (토글) */
export async function toggleHabitService({ habitId, password }) {
  // habit + history + study로 따라 들어가 비밀번호 검증
  const target = await prisma.habit.findUnique({
    where: { id: habitId },
    select: {
      id: true,
      isDone: true,
      date: true,
      habitHistoryId: true,
      habitHistory: {
        select: {
          id: true,
          studyId: true,
          weekDate: true,
        },
      },
    },
  });

  if (!target) {
    const e = new Error('해당 습관이 존재하지 않습니다.');
    e.name = 'NotFoundError';
    throw e;
  }

  // 스터디 인증
  await assertStudyWithPassword({
    studyId: target.habitHistory.studyId,
    password,
  });

  // 토글
  const updated = await prisma.habit.update({
    where: { id: habitId },
    data: { isDone: !target.isDone },
    select: { id: true, isDone: true, date: true, habitHistoryId: true },
  });

  // KST 기준 오늘 날짜 문자열을 만들어 day-of-week 판정
  const kRange = getKSTDayRange(updated.date);
  const dayHabits = await prisma.habit.findMany({
    where: {
      habitHistoryId: updated.habitHistoryId,
      date: { gte: kRange.startUtc, lt: kRange.endUtc },
    },
    select: { isDone: true },
  });
  const anyDone = dayHabits.some(h => h.isDone);

  // KST 기준 요일: 0=일 ~ 6=토
  const kst = new Date(updated.date.getTime() + 9 * 3600000);
  const dow = kst.getUTCDay();

  const dayFieldMap = {
    1: 'monDone',
    2: 'tueDone',
    3: 'wedDone',
    4: 'thuDone',
    5: 'friDone',
    6: 'satDone',
    0: 'sunDone',
  };
  const field = dayFieldMap[dow];

  await prisma.habitHistory.update({
    where: { id: updated.habitHistoryId },
    data: { [field]: anyDone },
  });

  return {
    habitId: updated.id,
    isDone: updated.isDone,
    date: updated.date,
    habitHistoryId: updated.habitHistoryId,
  };
}

/** GET 주간 습관 기록 조회 */
export async function getWeekHabitsService({ studyId, password, dateStr }) {
  const study = await assertStudyWithPassword({ studyId, password });

  const { weekStartUtc, weekEndUtc, weekDateOnly } = getKSTWeekRange(dateStr);

  const history = await prisma.habitHistory.findUnique({
    where: { studyId_weekDate: { studyId, weekDate: weekDateOnly } },
    select: {
      id: true,
      monDone: true,
      tueDone: true,
      wedDone: true,
      thuDone: true,
      friDone: true,
      satDone: true,
      sunDone: true,
    },
  });

  // 해당 주에 단 한 번도 오늘의 습관 생성이 없었다면 history가 없을 수 있음
  const habits = await prisma.habit.findMany({
    where: {
      date: { gte: weekStartUtc, lt: weekEndUtc },
      habitHistory: { is: { studyId } },
    },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  });

  // 응답용: 날짜별 → [ {habitId, title, isDone} ]
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartUtc.getTime() + i * 24 * 3600000);
    days[d.toISOString().slice(0, 10)] = [];
  }
  habits.forEach(h => {
    const ymd = new Date(h.date.getTime() + 9 * 3600000) // to KST
      .toISOString()
      .slice(0, 10);
    if (!days[ymd]) days[ymd] = [];
    days[ymd].push({
      habitId: h.id,
      title: h.habit,
      isDone: h.isDone,
    });
  });

  return {
    study: { id: study.id, name: study.name, isActive: study.isActive },
    week: {
      start: new Date(weekStartUtc.getTime() + 9 * 3600000)
        .toISOString()
        .slice(0, 10),
      end: new Date(weekEndUtc.getTime() - 1 + 9 * 3600000)
        .toISOString()
        .slice(0, 10),
      weekDate: weekDateOnly, // HabitHistory.weekDate
      summary: history
        ? {
            monDone: history.monDone,
            tueDone: history.tueDone,
            wedDone: history.wedDone,
            thuDone: history.thuDone,
            friDone: history.friDone,
            satDone: history.satDone,
            sunDone: history.sunDone,
          }
        : null,
    },
    days,
  };
}
