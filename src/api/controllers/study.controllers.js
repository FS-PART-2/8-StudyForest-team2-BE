// 요청 파싱(params/query/body) + 입력 검증 결과 처리
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

export default { controlStudyList };
