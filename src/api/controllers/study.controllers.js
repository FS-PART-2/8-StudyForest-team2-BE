// 요청 파싱(params/query/body) + 입력 검증 결과 처리
import { assert } from 'superstruct';
import { createStudy, patchStudy } from '../structs.js';
import studyService from '../services/study.services.js';
import argon2 from 'argon2';

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
  const isActiveRaw = req.query.isActive;
  const isActive =
    typeof isActiveRaw === 'string'
      ? (/^(true|1)$/i.test(isActiveRaw)
          ? true
          : (/^(false|0)$/i.test(isActiveRaw)
              ? false
              : undefined))
      : undefined;

  /* 서비스 호출 */
  const studyList = await studyService.serviceStudyList({
    offset,
    limit,
    keyword,
    pointOrder,
    recentOrder,
    isActive,
  });

  /* 결과 반환 */
  res.json(studyList);
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
  const { nick, name, content, img, password, isActive } =
    req.body;
  const studyId = Number.parseInt(req.params.studyId, 10);
  if (!Number.isFinite(studyId) || studyId <= 0) {
    const err = new Error("유효하지 않은 스터디 ID입니다.");
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

  const password = req.body.password;
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

  const { id, _, count  } = req.body;
  const emojiSymbol = id.toString();
  if (typeof emojiSymbol !== 'string' || emojiSymbol.length === 0) {
    const err = new Error('이모지 심볼이 누락되었습니다.');
    err.status = 400;
    err.code = 'EMOJI_SYMBOL_REQUIRED';
    throw err;
  }
  const emojiCount = Number.parseInt(count, 10);
  if (!Number.isFinite(emojiCount) || emojiCount < 0) {
    const err = new Error('유효하지 않은 이모지 횟수입니다.');
    err.status = 400;
    err.code = 'INVALID_EMOJI_COUNT';
    throw err;
  }

  /* 서비스 호출 */
  const updatedEmojis = await studyService.serviceEmojiIncrement(
    studyId,
    emojiSymbol,
    emojiCount,
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

  const { id, _, count  } = req.body;
  const emojiSymbol = id.toString();
  if (typeof emojiSymbol !== 'string' || emojiSymbol.length === 0) {
    const err = new Error('이모지 심볼이 누락되었습니다.');
    err.status = 400;
    err.code = 'EMOJI_SYMBOL_REQUIRED';
    throw err;
  }

  const emojiCount = Number.parseInt(count, 10);
  if (!Number.isFinite(emojiCount) || emojiCount < 1) {
    const err = new Error('유효하지 않은 이모지 횟수입니다.');
    err.status = 400;
    err.code = 'INVALID_EMOJI_COUNT';
    throw err;
  }

  /* 서비스 호출 */
  const updatedEmojis = await studyService.serviceEmojiDecrement(
    studyId,
    emojiSymbol,
    emojiCount,
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

  controlEmojiIncrement,
  controlEmojiDecrement,
};
