// src/api/controllers/habit.controllers.js
// 요청 파싱(params/query) + 입력 검증 + 서비스 호출 + 에러 변환

import getTodayHabitsService, {
  createTodayHabitsService,
  toggleHabitService,
  getWeekHabitsService,
} from '../services/habit.services.js';

/* 오늘의 습관 조회 */
async function getTodayHabitsController(req, res, next) {
  try {
    const studyIdStr = req.params.studyId;
    if (!/^\d+$/.test(studyIdStr)) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }
    const studyId = Number.parseInt(studyIdStr, 10);
    if (studyId <= 0) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }

    const headerPwd = req.get('x-study-password');
    const bodyPwd =
      typeof req.body?.password === 'string' ? req.body.password : undefined;
    const password =
      typeof headerPwd === 'string' && headerPwd.length > 0
        ? headerPwd
        : bodyPwd;

    if (!password) {
      return res.status(400).json({ message: '비밀번호가 필요합니다.' });
    }

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
    return next(err);
  }
}

/* 오늘의 습관 생성 (배열로 들어온 title들을 오늘 날짜로 생성) */
async function createTodayHabitsController(req, res, next) {
  try {
    const studyIdStr = req.params.studyId;
    if (!/^\d+$/.test(studyIdStr)) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }
    const studyId = Number.parseInt(studyIdStr, 10);
    if (studyId <= 0) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }

    const headerPwd = req.get('x-study-password');
    const bodyPwd =
      typeof req.body?.password === 'string' ? req.body.password : undefined;
    const password =
      typeof headerPwd === 'string' && headerPwd.length > 0
        ? headerPwd
        : bodyPwd;

    if (!password) {
      return res.status(400).json({ message: '비밀번호가 필요합니다.' });
    }

    // 입력 정규화: habits(string[]) 또는 items[{title}]
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
        .json({ message: '일부 습관은 이미 오늘 생성되어 있습니다.' });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ message: err.message });
    }
    return next(err);
  }
}

/* 오늘의 습관 체크/해제 (토글) */
async function toggleHabitController(req, res, next) {
  try {
    const habitIdStr = req.params.habitId;
    if (!/^\d+$/.test(habitIdStr)) {
      return res
        .status(400)
        .json({ message: 'habitId는 1 이상의 정수여야 합니다.' });
    }
    const habitId = Number.parseInt(habitIdStr, 10);
    if (habitId <= 0) {
      return res
        .status(400)
        .json({ message: 'habitId는 1 이상의 정수여야 합니다.' });
    }

    const headerPwd = req.get('x-study-password');
    const bodyPwd =
      typeof req.body?.password === 'string' ? req.body.password : undefined;
    const password =
      typeof headerPwd === 'string' && headerPwd.length > 0
        ? headerPwd
        : bodyPwd;

    if (!password) {
      return res.status(400).json({ message: '비밀번호가 필요합니다.' });
    }

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
    return next(err);
  }
}

/* 주간 습관 기록 조회 */
async function getWeekHabitsController(req, res, next) {
  try {
    const studyIdStr = req.params.studyId;
    if (!/^\d+$/.test(studyIdStr)) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }
    const studyId = Number.parseInt(studyIdStr, 10);
    if (studyId <= 0) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }

    const headerPwd = req.get('x-study-password');
    const bodyPwd =
      typeof req.body?.password === 'string' ? req.body.password : undefined;
    const password =
      typeof headerPwd === 'string' && headerPwd.length > 0
        ? headerPwd
        : bodyPwd;

    if (!password) {
      return res.status(400).json({ message: '비밀번호가 필요합니다.' });
    }

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
    return next(err);
  }
}

export {
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
};

export default {
  getTodayHabitsController,
  createTodayHabitsController,
  toggleHabitController,
  getWeekHabitsController,
};
