// 요청 파싱(params/query) + 입력 검증 + 서비스 호출 + 에러 변환

import getTodayHabitsService from '../services/habit.services.js';

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
export { getTodayHabitsController };
export default { getTodayHabitsController };
