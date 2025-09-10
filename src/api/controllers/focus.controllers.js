// 요청 파싱(params/query/body) + 입력 검증 결과 처리
// eslint-disable-next-line import/extensions
import focusService from '../services/focus.services.js';

async function controlUpdateFocus(req, res) {
  /* 파라미터/바디 파싱 및 입력 검증 */
  const { studyId } = req.params;

  const points = Number(req.body.totalPoints);
  if (!points || points < 0) {
    const error = new Error('point 값은 0 이상의 숫자여야 합니다.');
    error.status = 400;
    throw error;
  }

  /* 서비스 호출 */
  const focusResult = await focusService.serviceUpdateFocus(points, studyId);

  /* 결과 반환 */
  res.status(200).json(focusResult);
}

export default {
  controlUpdateFocus,
};
