// 요청 파싱(params/query/body) + 입력 검증 결과 처리
import { assert } from 'superstruct';
import argon2 from 'argon2';
// eslint-disable-next-line import/extensions
import { createStudy, patchStudy } from '../structs.js';
// eslint-disable-next-line import/extensions
import studyService from '../services/study.services.js';

// 관리를 위한 전체 스터디 목록 조회 API 컨트롤러
async function controlGetStudy(req, res) {
  /* 서비스 호출 */
  const studies = await studyService.serviceGetStudy();

  /* 결과 반환 */
  res.status(200).json(studies);
}

// 스터디 목록 조회 API 컨트롤러
async function controlStudyList(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  // 1) 숫자 파라미터 정규화
  const hasOffset =
    req.query && Object.prototype.hasOwnProperty.call(req.query, 'offset');
  const hasLimit =
    req.query && Object.prototype.hasOwnProperty.call(req.query, 'limit');

  const offsetStr = hasOffset ? String(req.query.offset) : '0';
  const limitStr = hasLimit ? String(req.query.limit) : '6';

  const offsetNum = Number.parseInt(offsetStr, 10);
  const limitNum = Number.parseInt(limitStr, 10);

  const offset = Number.isInteger(offsetNum) && offsetNum >= 0 ? offsetNum : 0;
  const limit = Number.isInteger(limitNum) && limitNum >= 0 ? limitNum : 0;

  // 2) 정렬 단일화: sort (recent | old | points_desc | points_asc)
  //    - 한국어 라벨 및 레거시 파라미터(recentOrder/pointOrder)도 매핑 지원
  let sort = '';
  if (req.query && typeof req.query.sort === 'string') {
    const s = req.query.sort.toLowerCase();
    if (s === 'recent') sort = 'recent';
    else if (s === 'old') sort = 'old';
    else if (s === 'points_desc') sort = 'points_desc';
    else if (s === 'points_asc') sort = 'points_asc';
    // eslint-disable-next-line no-dupe-else-if
  } else if (req.query && typeof req.query.sort === 'string') {
    // no-op (위에서 처리)
  } else if (req.query && typeof req.query.recentOrder === 'string') {
    const r = req.query.recentOrder.toLowerCase();
    if (r === 'recent' || req.query.recentOrder === '최근 순') sort = 'recent';
    else if (r === 'old' || req.query.recentOrder === '오래된 순') sort = 'old';
  } else if (req.query && typeof req.query.pointOrder === 'string') {
    const p = req.query.pointOrder.toLowerCase();
    if (p === 'desc' || req.query.pointOrder === '많은 포인트 순')
      sort = 'points_desc';
    else if (p === 'asc' || req.query.pointOrder === '적은 포인트 순')
      sort = 'points_asc';
  }
  // 한국어 라벨 직접 전달 시 처리
  if (!sort && req.query && typeof req.query.sort === 'string') {
    const k = req.query.sort;
    if (k === '최근 순') sort = 'recent';
    else if (k === '오래된 순') sort = 'old';
    else if (k === '많은 포인트 순') sort = 'points_desc';
    else if (k === '적은 포인트 순') sort = 'points_asc';
  }
  if (!sort) sort = 'recent'; // 기본값

  // 3) 검색어/공개여부 파싱
  const keyword =
    req.query && typeof req.query.keyword === 'string'
      ? req.query.keyword.trim()
      : '';

  let isActive; // undefined | boolean
  if (req.query && typeof req.query.isActive === 'string') {
    const v = req.query.isActive.toLowerCase();
    if (v === 'true' || v === '1') isActive = true;
    else if (v === 'false' || v === '0') isActive = false;
  }

  /* 서비스 호출 */
  // 4) 서비스 호출
  const { studies, totalCount } = await studyService.serviceStudyList({
    offset,
    limit,
    sort,
    isActive,
    keyword,
  });

  /* 결과 반환 */
  // 5) 응답
  return res.status(200).json({ studies, totalCount });
}

// 스터디 생성 API 컨트롤러
async function controlStudyCreate(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  assert(req.body, createStudy);
  const { nick, name, content, img, password, checkPassword, isActive } =
    req.body;
  if (password !== checkPassword) {
    const err = new Error('비밀번호와 확인용 비밀번호가 일치하지 않습니다.');
    err.status = 400;
    err.code = 'PASSWORD_MISMATCH';
    throw err;
  }
  const passwordHash = await argon2.hash(password);

  /* 서비스 호출 */
  const studyCreate = await studyService.serviceStudyCreate(
    nick,
    name,
    content,
    img,
    passwordHash,
    isActive,
  );

  /* 결과 반환 */
  res.status(201).location(`/api/studies/${studyCreate.id}`).json(studyCreate);
}

// 스터디 수정 API 컨트롤러
async function controlStudyUpdate(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  assert(req.body, patchStudy);
  const { nick, name, content, img, password, isActive } = req.body;
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  if (typeof password !== 'string' || password.length === 0) {
    const err = new Error('비밀번호가 누락되었습니다.');
    err.status = 400;
    err.code = 'PASSWORD_REQUIRED';
    throw err;
  }

  /* 서비스 호출 */
  const studyUpdate = await studyService.serviceStudyUpdate(
    Number.parseInt(req.params.studyId, 10),
    nick,
    name,
    content,
    img,
    password,
    isActive,
  );
  if (!studyUpdate) {
    const err = new Error('스터디 업데이트에 실패했습니다.');
    err.status = 404;
    err.code = 'STUDY_UPDATE_FAILED';
    throw err;
  }

  /* 결과 반환 */
  res.status(200).json(studyUpdate);
}

// 스터디 삭제 API 컨트롤러
async function controlStudyDelete(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  const { password } = req.body;
  if (typeof password !== 'string' || password.length === 0) {
    const err = new Error('비밀번호가 누락되었습니다.');
    err.status = 400;
    err.code = 'PASSWORD_REQUIRED';
    throw err;
  }

  /* 서비스 호출 */
  await studyService.serviceStudyDelete(studyId, password);

  /* 결과 반환 */
  res.status(204).end();
}

// 스터디 상세 조회 API 컨트롤러
async function controlStudyDetail(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  /* 서비스 호출 */
  const studyDetail = await studyService.serviceStudyDetail(studyId);
  if (!studyDetail) {
    const err = new Error('존재하지 않는 스터디 ID입니다.');
    err.status = 404;
    err.code = 'STUDY_NOT_FOUND';
    throw err;
  }

  /* 결과 반환 */
  res.status(200).json(studyDetail);
}

// 스터디 비밀번호 검증 API 컨트롤러
async function controlStudyVerifyPassword(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  const { password } = req.body;
  if (typeof password !== 'string' || password.length === 0) {
    const err = new Error('비밀번호가 누락되었습니다.');
    err.status = 400;
    err.code = 'PASSWORD_REQUIRED';
    throw err;
  }

  /* 서비스 호출 */
  const isPasswordValid = await studyService.serviceStudyVerifyPassword(studyId, password);

  /* 결과 반환 */
  res.status(200).json({ isPasswordValid });
}

// 이모지 횟수 증가 API 컨트롤러
async function controlEmojiIncrement(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  const { id } = req.body;
  const emojiId = id.toString();
  if (typeof emojiId !== 'string' || emojiId.length === 0) {
    const err = new Error('이모지 심볼이 누락되었습니다.');
    err.status = 400;
    err.code = 'EMOJI_SYMBOL_REQUIRED';
    throw err;
  }

  /* 서비스 호출 */
  const updatedEmojis = await studyService.serviceEmojiIncrement(
    studyId,
    emojiId,
  );

  /* 결과 반환 */
  res.status(200).json(updatedEmojis);
}

// 이모지 횟수 감소 API 컨트롤러
async function controlEmojiDecrement(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  const { id } = req.body;
  const emojiSymbol = id.toString();
  if (typeof emojiSymbol !== 'string' || emojiSymbol.length === 0) {
    const err = new Error('이모지 심볼이 누락되었습니다.');
    err.status = 400;
    err.code = 'EMOJI_SYMBOL_REQUIRED';
    throw err;
  }

  /* 서비스 호출 */
  const updatedEmojis = await studyService.serviceEmojiDecrement(
    studyId,
    emojiSymbol,
  );

  /* 결과 반환 */
  res.status(200).json(updatedEmojis);
}

export default {
  controlGetStudy,
  controlStudyList,
  controlStudyCreate,
  controlStudyUpdate,
  controlStudyDelete,
  controlStudyDetail,
  controlStudyVerifyPassword,

  controlEmojiIncrement,
  controlEmojiDecrement,
};
