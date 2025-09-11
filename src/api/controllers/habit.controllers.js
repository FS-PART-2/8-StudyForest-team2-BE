// 요청 파싱(params/query) + 입력 검증 + 서비스 호출 + 에러 변환

import getTodayHabitsService, {
  getDailyHabitsService,
  createTodayHabitsService,
  toggleHabitService,
  getWeekHabitsService,
  renameTodayHabitService,
  deleteTodayHabitService,
  addTodayHabitService,
} from '../services/habit.services.js';
function parsePositiveParam(req, name) {
  const raw = req.params?.[name];
  if (!/^\d+$/.test(raw || '')) {
    const e = new Error(`${name}는 1 이상의 정수여야 합니다.`);
    e.status = 400;
    throw e;
  }
  const n = Number.parseInt(raw, 10);
  if (n <= 0) {
    const e = new Error(`${name}는 1 이상의 정수여야 합니다.`);
    e.status = 400;
    throw e;
  }
  return n;
}

// function parsePassword(req) {
//   const headerPwd = req.get('x-study-password');
//   const bodyPwd =
//     typeof req.body?.password === 'string' ? req.body.password : undefined;
//   const password =
//     typeof headerPwd === 'string' && headerPwd.length > 0 ? headerPwd : bodyPwd;
//   if (!password) {
//     const e = new Error('비밀번호가 필요합니다.');
//     e.status = 400;
//     throw e;
//   }
//   return password;
// }
/*오늘의 습관 조회 */
async function getTodayHabitsController(req, res, next) {
  try {
    const studyId = parsePositiveParam(req, 'studyId');
    const data = await getTodayHabitsService({ studyId });
    res.set('Cache-Control', 'no-store');
    return res.json(data);
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }

    return res
      .status(err.status || 500)
      .json({ message: err.message || 'SERVER_ERROR' });
  }
}

/* 습관 일괄 생성 (배열로 들어온 title들을 오늘 날짜로 생성)*/
async function createTodayHabitsController(req, res, next) {
  try {
    const studyId = parsePositiveParam(req, 'studyId');

    let titles = [];
    if (Array.isArray(req.body?.habits)) {
      titles = req.body.habits.filter(
        x => typeof x === 'string' && x.trim().length > 0,
      );
    } else if (Array.isArray(req.body?.items)) {
      titles = req.body.items
        .map(it => (typeof it?.title === 'string' ? it.title : ''))
        .filter(x => x.trim().length > 0);
    }

    if (!titles.length) {
      return res.status(400).json({
        message: '생성할 습관 목록(habits 또는 items.title)이 필요합니다.',
      });
    }

    const data = await createTodayHabitsService({ studyId, titles });
    res.set('Cache-Control', 'no-store');
    return res.status(201).json(data);
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: err.message });
    }
    if (err.code === 'P2002') {
      // Prisma unique 에러(동일 항목 일부 중복)
      return res
        .status(409)
        .json({ message: '이 습관은 이미 생성되어 있습니다.' });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }
    return res
      .status(err.status || 500)
      .json({ message: err.message || 'SERVER_ERROR' });
  }
}
// ✅ 선택 입력 검증용: 값이 없으면 undefined, 있으면 1 이상의 정수만 통과
function parseOptionalPositive(n) {
  if (n === undefined || n === null || n === '') return undefined;
  const s = String(n);
  if (!/^\d+$/.test(s)) {
    const e = new Error('studyId는 1 이상의 정수여야 합니다.');
    e.status = 400;
    throw e;
  }
  const v = Number.parseInt(s, 10);
  if (v <= 0) {
    const e = new Error('studyId는 1 이상의 정수여야 합니다.');
    e.status = 400;
    throw e;
  }
  return v;
}

/** 오늘의 습관 체크/해제 (토글) */

async function toggleHabitController(req, res) {
  try {
    const habitId = parsePositiveParam(req, 'habitId');
    // ✅ 선택적으로 들어오는 studyId 수용 (params > query > body > header)
    const studyIdOptional = parseOptionalPositive(
      req.params?.studyId ??
        req.query?.studyId ??
        req.body?.studyId ??
        req.get('x-study-id'),
    );

    const data = await toggleHabitService({ habitId });

    // ✅ 일치성 검사: 선택 studyId가 있으면, 실제 소속 studyId와 비교
    if (studyIdOptional !== undefined && data.studyId !== studyIdOptional) {
      const e = new Error(
        '요청된 studyId와 습관의 소속 스터디가 일치하지 않습니다.',
      );
      e.status = 400;
      throw e;
    }
    res.set('Cache-Control', 'no-store');
    return res.json(data);
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }
    return res
      .status(err.status || 500)
      .json({ message: err.message || 'SERVER_ERROR' });
  }
}

/* 주간 습관 기록 조회*/

async function getWeekHabitsController(req, res) {
  try {
    const studyId = parsePositiveParam(req, 'studyId');

    const dateStr =
      typeof req.query?.date === 'string' ? req.query.date : undefined;

    const data = await getWeekHabitsService({ studyId, dateStr });
    res.set('Cache-Control', 'no-store');
    return res.json(data);
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }
    return res
      .status(err.status || 500)
      .json({ message: err.message || 'SERVER_ERROR' });
  }
}
/* 오늘의 습관 이름 변경*/
async function renameTodayHabitController(req, res) {
  const studyId = parsePositiveParam(req, 'studyId');
  const habitId = parsePositiveParam(req, 'habitId');

  const newTitle = String(req.body?.title || '').trim();
  if (!newTitle) {
    return res.status(400).json({ message: 'title은 1자 이상이어야 합니다.' });
  }

  try {
    const result = await renameTodayHabitService({
      studyId,
      habitId,
      newTitle,
    });
    res.set('Cache-Control', 'no-store');
    return res.json(result);
  } catch (err) {
    if (err.name === 'UnauthorizedError')
      return res.status(401).json({ message: err.message });
    if (err.name === 'NotFoundError')
      return res.status(404).json({ message: err.message });
    if (err.name === 'ConflictError' || err.code === 'P2002')
      return res
        .status(409)
        .json({ message: err.message, conflicts: err.conflicts });
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
}
/*오늘의 습관 삭제*/
async function deleteTodayHabitController(req, res) {
  const studyId = parsePositiveParam(req, 'studyId');
  const habitId = parsePositiveParam(req, 'habitId');

  try {
    const result = await deleteTodayHabitService({
      studyId,
      habitId,
    });
    res.set('Cache-Control', 'no-store');
    return res.json(result);
  } catch (err) {
    if (err.name === 'UnauthorizedError')
      return res.status(401).json({ message: err.message });
    if (err.name === 'NotFoundError')
      return res.status(404).json({ message: err.message });
    if (err.name === 'ConflictError') {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
}
/* 습관 단일 생성 */
async function addTodayHabitController(req, res) {
  const studyId = parsePositiveParam(req, 'studyId');
  const title = String(req.body?.title || '').trim();
  if (!title) {
    return res.status(400).json({ message: 'title은 1자 이상이어야 합니다.' });
  }

  try {
    const result = await addTodayHabitService({ studyId, title });
    res.set('Cache-Control', 'no-store');
    return res.status(201).json(result);
  } catch (err) {
    if (err.name === 'UnauthorizedError')
      return res.status(401).json({ message: err.message });
    if (err.name === 'NotFoundError')
      return res.status(404).json({ message: err.message });
    if (err.name === 'ConflictError')
      return res.status(409).json({ message: err.message });
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
}
async function getHabitsQueryController(req, res) {
  try {
    const rawStudyId = req.query?.studyId;
    const studyId = Number.parseInt(String(rawStudyId ?? ''), 10);
    if (!Number.isFinite(studyId) || studyId <= 0) {
      const e = new Error('studyId는 1 이상의 정수여야 합니다.');
      e.status = 400;
      throw e;
    }

    const dateStr =
      typeof req.query?.date === 'string' ? req.query.date : undefined;

    // 날짜 유효성(선택): YYYY-MM-DD 형태라면 Date로 파싱 가능
    if (dateStr && !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const e = new Error('date는 YYYY-MM-DD 형식이어야 합니다.');
      e.status = 400;
      throw e;
    }

    const data = await getDailyHabitsService({ studyId, dateStr });

    res.set('Cache-Control', 'no-store');
    return res.json(data);
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }
    return res
      .status(err.status || 500)
      .json({ message: err.message || 'SERVER_ERROR' });
  }
}
export {
  getHabitsQueryController,
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
  renameTodayHabitController,
  deleteTodayHabitController,
  addTodayHabitController,
};
