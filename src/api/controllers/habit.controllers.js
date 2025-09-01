// 요청 파싱(params/query) + 입력 검증 + 서비스 호출 + 에러 변환

import getTodayHabitsService from '../services/habit.services.js';

async function getTodayHabitsController(req, res, next) {
  try {
    const studyId = Number(req.params.studyId);
    if (!Number.isInteger(studyId) || studyId <= 0) {
      return res
        .status(400)
        .json({ message: 'studyId는 1 이상의 정수여야 합니다.' });
    }

    const { password } = req.query;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'password query가 필요합니다.' });
    }

    const data = await getTodayHabitsService({ studyId, password });
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
export default { getTodayHabitsController };
