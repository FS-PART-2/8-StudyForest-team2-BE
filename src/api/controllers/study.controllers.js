// 요청 파싱(params/query/body) + 입력 검증 결과 처리
import { assert } from 'superstruct';
import { createStudy } from '../structs.js';
import studyService from '../services/study.services.js';

// 스터디 목록 조회 API
async function controlStudyList(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const offsetRaw = Number.parseInt(req.query.offset ?? '0', 10);
  const limitRaw = Number.parseInt(req.query.limit ?? '6', 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 6; // 상한 50
  const keyword =
    typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
  const pointOrderRaw =
    typeof req.query.pointOrder === 'string'
      ? req.query.pointOrder.toLowerCase()
      : 'asc';
  const recentOrderRaw =
    typeof req.query.recentOrder === 'string'
      ? req.query.recentOrder.toLowerCase()
      : 'recent';
  const pointOrder = pointOrderRaw === 'desc' ? 'desc' : 'asc';
  const recentOrder = recentOrderRaw === 'old' ? 'old' : 'recent';

  // 서비스 호출
  const studyList = await studyService.serviceStudyList({
    offset,
    limit,
    keyword,
    pointOrder,
    recentOrder,
  });

  res.json(studyList);
}

async function controlStudyCreate(req, res) {
  /* 입력 검증 */
  assert(req.body, createStudy);
  const { nick, name, content, img, password, checkPassword, isActive } =
    req.body;
  if (password !== checkPassword) {
    res
      .status(400)
      .json({ error: '비밀번호와 확인용 비밀번호가 일치하지 않습니다.' });
    return;
  }

  /* 서비스 호출 */

  const studyCreate = await studyService.serviceStudyCreate(
    nick,
    name,
    content,
    img,
    password,
    isActive,
  );

  /* 결과 반환 */
  res.status(200).json(studyCreate);
}

export default { controlStudyList, controlStudyCreate };
