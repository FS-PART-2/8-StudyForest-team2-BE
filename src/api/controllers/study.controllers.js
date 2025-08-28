// 요청 파싱(params/query/body) + 입력 검증 결과 처리
import studyService from '../services/Study.Services.js';

// 스터디 목록 조회 API
async function controlStudyList(req, res) {
  /* 쿼리 파라미터 파싱 */
  const offset = parseInt(req.query.offset, 10) || 0;
  const keyword = req.query.keyword || '';
  const pointOrder = req.query.pointOrder || 'asc';
  const recentOrder = req.query.recentOrder || 'recent';

  /* 입력 검증 */
  const validPointOrders = ['asc', 'desc'].includes(pointOrder)
    ? pointOrder
    : 'asc'; // 포인트 정렬 필드 검증
  const validRecentOrders = ['recent', 'old'].includes(recentOrder)
    ? recentOrder
    : 'recent'; // 기간 정렬 필드 검증

  // 서비스 호출
  const studyList = await studyService.serviceStudyList({
    offset,
    keyword,
    pointOrder: validPointOrders,
    recentOrder: validRecentOrders,
  });

  res.json(studyList);
}

export default { controlStudyList };
