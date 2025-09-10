// 요청 파싱(params/query) + 입력 검증 + 서비스 호출 + 에러 변환

import getTodayHabitsService, {
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

function parsePassword(req) {
  const headerPwd = req.get('x-study-password');
  const bodyPwd =
    typeof req.body?.password === 'string' ? req.body.password : undefined;
  const password =
    typeof headerPwd === 'string' && headerPwd.length > 0 ? headerPwd : bodyPwd;
  if (!password) {
    const e = new Error('비밀번호가 필요합니다.');
    e.status = 400;
    throw e;
  }
  return password;
}
/*오늘의 습관 조회 */
async function getTodayHabitsController(req, res, next) {
  try {
    const studyId = parsePositiveParam(req, 'studyId');
    const password = parsePassword(req);
    const data = await getTodayHabitsService({ studyId, password });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
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

    const password = parsePassword(req);

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

    const data = await createTodayHabitsService({ studyId, password, titles });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
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

/** 오늘의 습관 체크/해제 (토글) */

async function toggleHabitController(req, res, next) {
  try {
    const habitId = parsePositiveParam(req, 'habitId');

    const password = parsePassword(req);

    const data = await toggleHabitService({ habitId, password });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
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

async function getWeekHabitsController(req, res, next) {
  try {
    const studyId = parsePositiveParam(req, 'studyId');

    const password = parsePassword(req);

    const dateStr =
      typeof req.query?.date === 'string' ? req.query.date : undefined;

    const data = await getWeekHabitsService({ studyId, password, dateStr });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
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
  const password = parsePassword(req);
  const habitId = parsePositiveParam(req, 'habitId');

  const newTitle = String(req.body?.title || '').trim();
  if (!newTitle) {
    return res.status(400).json({ message: 'title은 1자 이상이어야 합니다.' });
  }

  try {
    const result = await renameTodayHabitService({
      studyId,
      password,
      habitId,
      newTitle,
    });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
    return res.json(result);
  } catch (err) {
    if (err.name === 'UnauthorizedError')
      return res.status(401).json({ message: err.message });
    if (err.name === 'NotFoundError')
      return res.status(404).json({ message: err.message });
    if (err.name === 'ConflictError')
      return res
        .status(409)
        .json({ message: err.message, conflicts: err.conflicts });
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
}
/*오늘의 습관 삭제*/
async function deleteTodayHabitController(req, res) {
  const studyId = parsePositiveParam(req, 'studyId');
  const password = parsePassword(req);
  const habitId = parsePositiveParam(req, 'habitId');

  try {
    const result = await deleteTodayHabitService({
      studyId,
      password,
      habitId,
    });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
    return res.json(result);
  } catch (err) {
    if (err.name === 'UnauthorizedError')
      return res.status(401).json({ message: err.message });
    if (err.name === 'NotFoundError')
      return res.status(404).json({ message: err.message });
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
}
/* 습관 단일 생성 */
async function addTodayHabitController(req, res) {
  const studyId = parsePositiveParam(req, 'studyId');
  const password = parsePassword(req);
  const title = String(req.body?.title || '').trim();
  if (!title) {
    return res.status(400).json({ message: 'title은 1자 이상이어야 합니다.' });
  }

  try {
    const result = await addTodayHabitService({ studyId, password, title });
    res.set('Cache-Control', 'no-store');
    res.vary('x-study-password');
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

export {
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
  renameTodayHabitController,
  deleteTodayHabitController,
  addTodayHabitController,
};
