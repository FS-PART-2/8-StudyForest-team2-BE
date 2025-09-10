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
 * 주 시작일(월요일 00:00 KST)의 UTC Date 반환 + 주 끝(다음주 월요일 00:00 KST 직전)
 */
function getKSTWeekRange(dateInput /* string|Date|undefined */) {
  const base = dateInput ? new Date(dateInput) : new Date();
  const baseKst = new Date(base.getTime() + 9 * 3600000); // to KST

  // JS: 0=Sun ~ 6=Sat → 월요일을 주 시작으로
  const day = baseKst.getUTCDay(); // (KST clock)
  const diffToMon = (day + 6) % 7; // Mon=0, Tue=1, ... Sun=6

  const monKstUTC = Date.UTC(
    baseKst.getUTCFullYear(),
    baseKst.getUTCMonth(),
    baseKst.getUTCDate() - diffToMon,
    0,
    0,
    0,
    0,
  );

  const monUtc = new Date(monKstUTC - 9 * 3600000); // 주 시작(UTC)
  const nextMonUtc = new Date(monUtc.getTime() + 7 * 24 * 3600000); // 주 끝(미포함)
  const weekDateOnly = new Date(monUtc); // HabitHistory.weekDate용 (@db.Date)

  return {
    weekStartUtc: monUtc, // 포함
    weekEndUtc: nextMonUtc, // 미포함
    weekDateOnly, // HabitHistory.weekDate용
  };
}

/**
 * 스터디 + 비밀번호 검증 (argon2/평문 seed 지원)
 * - 컨트롤러에서 password 누락은 400으로 걸러지므로 여기서는 불일치만 401 처리
 */
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
  if (!study.password) {
    // 비번이 설정되지 않은 스터디는 정책상 인증 불가로 처리
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

/*  GET 오늘의 습관 조회 */
export default async function getTodayHabitsService({ studyId, password }) {
  // 1) 인증
  const study = await assertStudyWithPassword({ studyId, password });

  // 2) 오늘 범위 계산 (KST)
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

/* POST 오늘의 습관 생성*/
export async function createTodayHabitsService({ studyId, password, titles }) {
  const study = await assertStudyWithPassword({ studyId, password });

  const { startUtc, endUtc, nowKstIso, kstDateStr } = getKSTDayRange();
  const { weekDateOnly } = getKSTWeekRange(startUtc);

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
    date: startUtc, // KST 00:00을 UTC로 환산한 시각
    isDone: false,
    habitHistoryId: hh.id,
  }));

  const createRes = await prisma.habit.createMany({
    data: dataToCreate,
    skipDuplicates: true,
  });

  // 3) 오늘 전체 목록 반환
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
  // 1) 대상 조회
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

  // 2) 스터디 인증
  await assertStudyWithPassword({
    studyId: target.habitHistory.studyId,
    password,
  });

  // 3) 토글
  const { startUtc, endUtc } = getKSTDayRange();
  const isTodayKST = target.date >= startUtc && target.date < endUtc;
  if (!isTodayKST) {
    const e = new Error('오늘 기록만 체크/해제할 수 있습니다.');
    e.name = 'BadRequestError';
    e.status = 400;
    throw e;
  }
  const updated = await prisma.habit.update({
    where: { id: habitId },
    data: { isDone: !target.isDone },
    select: { id: true, isDone: true, date: true, habitHistoryId: true },
  });

  // 4) 동일한 KST 날짜의 완료 여부(ANY)로 요약 필드 갱신
  const kRange = getKSTDayRange(updated.date);
  const dayHabits = await prisma.habit.findMany({
    where: {
      habitHistoryId: updated.habitHistoryId,
      date: { gte: kRange.startUtc, lt: kRange.endUtc },
    },
    select: { isDone: true },
  });
  const anyDone = dayHabits.some(h => h.isDone);

  // KST 요일: 0=일 ~ 6=토
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

/* GET 주간 습관 기록 조회 (KST 기준으로 days 키 통일) */
export async function getWeekHabitsService({ studyId, password, dateStr }) {
  const study = await assertStudyWithPassword({ studyId, password });

  const { weekStartUtc, weekEndUtc, weekDateOnly } = getKSTWeekRange(dateStr);

  // 주간 요약(HabitHistory) 조회 (없을 수도 있음)
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

  // 해당 주의 모든 Habit 조회
  const habits = await prisma.habit.findMany({
    where: {
      date: { gte: weekStartUtc, lt: weekEndUtc },
      habitHistory: { is: { studyId } },
    },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  });

  // KST 기준으로 days 초기 키 생성 (YYYY-MM-DD)
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartUtc.getTime() + i * 24 * 3600000); // UTC 시각
    const dKst = new Date(d.getTime() + 9 * 3600000); // → KST 시각
    const key = dKst.toISOString().slice(0, 10); // YYYY-MM-DD
    days[key] = [];
  }

  // 각 habit을 KST 날짜 키로 푸시
  habits.forEach(h => {
    const ymdKst = new Date(h.date.getTime() + 9 * 3600000)
      .toISOString()
      .slice(0, 10);
    if (!days[ymdKst]) days[ymdKst] = [];
    days[ymdKst].push({
      habitId: h.id,
      title: h.habit,
      isDone: h.isDone,
    });
  });

  // 응답 (week.start/end도 KST 문자열로 표시)
  return {
    study: { id: study.id, name: study.name, isActive: study.isActive },
    week: {
      start: new Date(weekStartUtc.getTime() + 9 * 3600000)
        .toISOString()
        .slice(0, 10),
      end: new Date(weekEndUtc.getTime() - 1 + 9 * 3600000)
        .toISOString()
        .slice(0, 10),
      weekDate: weekDateOnly, // HabitHistory.weekDate (@db.Date)
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
// 오늘의 습관 이름 수정
export async function renameTodayHabitService({
  studyId,
  password,
  habitId,
  newTitle,
}) {
  await assertStudyWithPassword({ studyId, password });
  const { startUtc, endUtc } = getKSTDayRange(); // 오늘 24:00(KST) 기준

  return await prisma.$transaction(async tx => {
    // 1) 오늘 습관(=기준 습관) 찾기 + 소속 검증
    const base = await tx.habit.findFirst({
      where: {
        id: habitId,
        date: { gte: startUtc, lt: endUtc }, // 오늘(포함) 레코드여야 함
        habitHistory: { is: { studyId } },
      },
      select: { id: true, habit: true, habitHistoryId: true, date: true },
    });
    if (!base) {
      const e = new Error('해당 습관을 찾을 수 없습니다(오늘 기록이 아님).');
      e.name = 'NotFoundError';
      throw e;
    }

    // 2) 충돌 검사
    const conflicts = await tx.habit.findMany({
      where: {
        habitHistoryId: base.habitHistoryId,
        habit: newTitle,
        date: { gte: startUtc, lt: endUtc },
      },
      select: { id: true, date: true },
    });
    if (conflicts.length > 0) {
      const e = new Error('동일 날짜에 같은 이름의 습관이 이미 존재합니다.');
      e.name = 'ConflictError';
      e.conflicts = conflicts.map(c => c.date);
      throw e;
    }

    // 3) 변경 대상 조회
    const targets = await tx.habit.findMany({
      where: {
        habitHistoryId: base.habitHistoryId,
        habit: base.habit,
        date: { gte: startUtc, lt: endUtc },
      },
      select: { id: true },
    });
    if (targets.length === 0) {
      return { updated: 0, newTitle };
    }

    // 4) 일괄 변경
    const updated = await tx.habit.updateMany({
      where: { id: { in: targets.map(t => t.id) } },
      data: { habit: newTitle },
    });

    return { updated: updated.count, newTitle };
  });
}

// 오늘의 습관 삭제

export async function deleteTodayHabitService({ studyId, password, habitId }) {
  await assertStudyWithPassword({ studyId, password });
  const { startUtc } = getKSTDayRange();

  const base = await prisma.habit.findFirst({
    where: {
      id: habitId,
      habitHistory: { is: { studyId } },
    },
    select: { id: true, habit: true, habitHistoryId: true },
  });
  if (!base) {
    const e = new Error('해당 습관을 찾을 수 없습니다.');
    e.name = 'NotFoundError';
    throw e;
  }

  const del = await prisma.habit.deleteMany({
    where: {
      habitHistoryId: base.habitHistoryId,
      habit: base.habit,
      date: { gte: startUtc }, // 오늘부터(미래 포함) 제거
    },
  });

  return { deleted: del.count };
}

//새로운 습관 추가

export async function addTodayHabitService({ studyId, password, title }) {
  // 스터디 인증 + 오늘 HabitHistory 보장
  const study = await assertStudyWithPassword({ studyId, password });
  const { startUtc, endUtc } = getKSTDayRange();
  const { weekDateOnly } = getKSTWeekRange(startUtc);
  return await prisma.$transaction(async tx => {
    // 1) 오늘 해당 스터디의 HabitHistory 가져오기
    let hh = await tx.habitHistory.findUnique({
      where: {
        studyId_weekDate: {
          studyId: study.id,
          weekDate: weekDateOnly,
        },
      },
    });

    if (!hh) {
      // 최초 생성 케이스
      hh = await tx.habitHistory.create({
        data: {
          studyId: study.id,
          weekDate: weekDateOnly, // 오늘 00:00(KST)의 날짜부만 쓰는 셈
        },
      });
    }

    // 2) 오늘 중복 검사 (unique: [habitHistoryId, date, habit])
    const dup = await tx.habit.findFirst({
      where: {
        habitHistoryId: hh.id,
        date: { gte: startUtc, lt: endUtc },
        habit: title.trim(),
      },
      select: { id: true },
    });
    if (dup) {
      const e = new Error('오늘 이미 같은 이름의 습관이 존재합니다.');
      e.name = 'ConflictError';
      throw e;
    }

    // 3) 오늘 레코드 생성
    let created;
    try {
      created = await tx.habit.create({
        data: {
          habitHistoryId: hh.id,
          habit: title.trim(),
          date: new Date(startUtc),
          isDone: false,
        },
        select: {
          id: true,
          habit: true,
          date: true,
          isDone: true,
          habitHistoryId: true,
          createdAt: true,
        },
      });
    } catch (err) {
      if (err?.code === 'P2002') {
        const e = new Error('오늘 이미 같은 이름의 습관이 존재합니다.');
        e.name = 'ConflictError';

        e.status = 409;

        throw e;
      }
      throw err;
    }

    return {
      created: {
        habitId: created.id,
        title: created.habit,
        date: created.date,
        isDone: created.isDone,
        habitHistoryId: created.habitHistoryId,
      },
    };
  });
}
export { getKSTDayRange, getKSTWeekRange, assertStudyWithPassword };
